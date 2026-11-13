# CLAUDE.md: Strutvane Contracts (`@strutvane/contracts`)

Project memory for Claude Code in this repository. Keep this file short, accurate and current.

## What this repo is

Shared TypeScript types and wire protocols that let Strutvane packages integrate without depending on each other: Actor, Tenant, Permission, QueryFilter, ListQuery, ResourceManifest, Problem, AuditEvent and more. Zero runtime dependencies.

It is one repo of the **Strutvane** polyrepo ecosystem (one GitHub repo per package; see ADR-0002). The hub with the full blueprint is https://github.com/vishwajit-vm/strutvane. Locally it is the umbrella folder two levels up: `../../docs/`.

## Status

- **Phase 0: v0 draft implemented** (`src/*.ts`), tested (`test/`, incl. type tests) and green on `pnpm run ci`. Not released yet (npm has only a placeholder). Changes follow RFC-0001 (`../../docs/rfcs/0001-contracts-v0.md`).
- Commands: `corepack pnpm@12.18.0 run ci` (must pass before any commit).
- Synced files (`tsconfig.base.json`, `biome.base.json`, `vitest.shared.ts`, `.github/workflows/*`, `.gitattributes`, `.gitignore`, `.editorconfig`) come from strutvane-tooling. Never edit them here.
- The source of truth for decisions is `../../docs/00-executive-summary.md` (D1–D20). If anything here conflicts with it, that file wins.
- The package spec is `../../docs/04-architecture.md` (online: https://github.com/vishwajit-vm/strutvane/blob/main/docs/04-architecture.md).

## Boundaries (non-negotiable)

- Allowed dependencies: Nothing. This package must never have runtime dependencies. Types and tiny constants only.
- Cooperation with other Strutvane packages happens **only through `@strutvane/contracts`**, resolved at runtime via the core container.
- Public API changes need a changeset, docs and tests. Contract changes need an RFC.

## Conventions (apply once code exists)

- TypeScript strict, ESM only, Node 24+ (Node 26 LTS is the target). No decorators or reflection.
- Validation uses Standard Schema with Zod 4 as the default. Errors are RFC 9457 problem+json.
- Tooling: pnpm, tsdown (build), Biome (lint/format), Vitest (tests), Playwright (UI e2e), Testcontainers (DB).
- Code generation and AST work pin the TypeScript 6 compiler API (`@typescript/typescript6`), because TypeScript 7 has no compiler API.
- Releases: Changesets, npm trusted publishing (OIDC) with provenance. Core packages share a major release train.
- **Docker is local-only and never committed** (ADR-0006). Never commit `.env`; keep `.env.example` complete and documented.
- Windows, macOS and Linux are all first-class. Use no bash-only scripts.

## Definition of done (for any change)

Code, tests, docs and a changeset ship together. Security implications are noted. The CLI help or reference is updated if commands changed.

## Where things are

- `.claude/skills/`: task playbooks for this package (invoke by name)
- `.claude/agents/`: specialised reviewer subagents
- `.claude/commands/`: slash commands (`/spec`, `/pre-pr`)
