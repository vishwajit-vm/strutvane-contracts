/**
 * The logging contract ([RFC-0004](https://github.com/vishwajit-vm/strutvane/blob/main/docs/rfcs/0004-logs-package.md)).
 *
 * Every Strutvane package logs through {@link Logger}, never through `console.*`. `@strutvane/core`
 * provides a minimal default implementation (structured, redacting, stdout), so logging always
 * works; `@strutvane/logs` replaces it with the full one (files, retention, viewer).
 *
 * @module
 */

/** Severity levels, from most verbose to most severe. */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/** Levels in ascending severity. A logger set to `info` emits `info`, `warn`, `error`, `fatal`. */
export const LOG_LEVELS: readonly LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

/** Numeric severity per level (compatible with the widely used pino/bunyan numbering). */
export const LOG_LEVEL_SEVERITY: Readonly<Record<LogLevel, number>> = Object.freeze({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
})

/**
 * Structured fields attached to a log record. Values must be JSON-serialisable; implementations
 * redact sensitive keys and patterns before anything is stored.
 */
export type LogFields = Readonly<Record<string, unknown>>

/** A serialised error inside a log record (stack and cause chain included, never thrown). */
export interface LogError {
  readonly name: string
  readonly message: string
  readonly stack?: string
  readonly code?: string
  readonly cause?: LogError
}

/** One log record as written by an implementation (one JSON line). */
export interface LogRecord {
  /** ISO-8601 timestamp (UTC). */
  readonly time: string
  readonly level: LogLevel
  /** The message, with control characters escaped (one call = one line). */
  readonly msg: string
  /** Request correlation, added automatically from the request context when available. */
  readonly requestId?: string
  readonly traceId?: string
  readonly tenantId?: string
  readonly actorId?: string
  /** Child-logger bindings such as `{ module: 'billing' }`, plus call-site fields. */
  readonly fields?: LogFields
  readonly err?: LogError
}

/** A structured, non-blocking logger. Implementations MUST never throw into the caller. */
export interface Logger {
  trace(msg: string, fields?: LogFields): void
  debug(msg: string, fields?: LogFields): void
  info(msg: string, fields?: LogFields): void
  warn(msg: string, fields?: LogFields): void
  error(msg: string, fields?: LogFields): void
  fatal(msg: string, fields?: LogFields): void
  /** A logger that adds `bindings` to every record it writes (e.g. `{ module: 'billing' }`). */
  child(bindings: LogFields): Logger
  /** Whether a level would be emitted (to skip building expensive fields). */
  isLevelEnabled(level: LogLevel): boolean
  /** Write out everything buffered. Resolves within a bounded time, even if a transport hangs. */
  flush(): Promise<void>
}
