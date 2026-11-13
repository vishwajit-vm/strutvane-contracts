/**
 * The installer protocol: how `pnpm sv add <package>` sets a package up completely, with config
 * files, `.env` + `.env.example` keys, migrations, routes and UI screens.
 *
 * `@strutvane/devkit` provides `defineInstaller()` and the real implementations of the context
 * below (staged, transactional file writes). Packages only depend on these interfaces.
 *
 * Status: **draft (v0)**.
 *
 * @module
 */

/** A file operation sink. All writes are staged and committed together at the end. */
export interface InstallFs {
  /** Does a file exist in the project (relative path)? */
  exists(path: string): Promise<boolean>
  /** Read a project file as UTF-8. */
  read(path: string): Promise<string>
  /** Stage a write. Existing files are only overwritten when `overwrite` is `true`. */
  write(path: string, content: string, options?: { readonly overwrite?: boolean }): Promise<void>
  /** Stage a deletion (used by uninstall). Removing a missing file is not an error. */
  remove(path: string): Promise<void>
}

/** One environment variable to add. */
export interface EnvVar {
  readonly key: string
  /** Value written to `.env`. Use `secret: true` to have a random secret generated instead. */
  readonly value?: string
  readonly secret?: boolean
  /** Comment written above the key in both files. */
  readonly comment?: string
}

/** Adds keys to `.env` (local values) and `.env.example` (empty values + comments). */
export interface InstallEnv {
  /** Add a titled block of variables. Existing keys are never overwritten. */
  add(section: string, vars: readonly EnvVar[]): Promise<void>
  /**
   * Remove keys this installer added (used by uninstall). The files themselves are kept, because they
   * may hold the developer's other values.
   */
  remove(keys: readonly string[]): Promise<void>
}

/** Dependency changes for the project's package.json. */
export interface InstallDeps {
  add(deps: Readonly<Record<string, string>>, options?: { readonly dev?: boolean }): Promise<void>
  /** Remove dependencies this installer added (used by uninstall). */
  remove(names: readonly string[]): Promise<void>
}

/** Edits to `strutvane.config.ts`. */
export interface InstallConfig {
  /** Register a service provider module, e.g. `"@strutvane/auth/provider"`. Idempotent. */
  registerProvider(moduleSpecifier: string): Promise<void>
  /** Unregister a provider module (used by uninstall). Idempotent. */
  unregisterProvider(moduleSpecifier: string): Promise<void>
}

/** Progress output. */
export interface InstallLogger {
  info(message: string): void
  warn(message: string): void
}

/** Everything an installer receives. */
export interface InstallContext {
  /** Absolute path of the project root. */
  readonly projectRoot: string
  /** Answers to the installer's prompts (or flags in non-interactive mode). */
  readonly answers: Readonly<Record<string, unknown>>
  /** When `true`, staged changes are shown as a diff and nothing is written. */
  readonly dryRun: boolean
  /** Is another Strutvane package installed? Used to add pieces to each other. */
  has(packageName: string): boolean
  readonly fs: InstallFs
  readonly env: InstallEnv
  readonly deps: InstallDeps
  readonly config: InstallConfig
  readonly log: InstallLogger
}

/** A package installer. MUST be idempotent: running it twice changes nothing the second time. */
export interface Installer {
  /** Package short name, e.g. `"auth"`. */
  readonly name: string
  readonly description?: string
  /** Packages this one enhances when present (e.g. auth enhances `"@strutvane/ui"`). */
  readonly enhances?: readonly string[]
  install(context: InstallContext): Promise<void>
  /** Reverse the install. Files the user edited are kept and listed, never deleted. */
  uninstall?(context: InstallContext): Promise<void>
}
