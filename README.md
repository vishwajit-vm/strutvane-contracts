<div align="center">

# Strutvane Contracts

**Shared TypeScript types and wire protocols that let Strutvane packages integrate without depending on each other: Actor, Tenant, Permission, QueryFilter, ListQuery, ResourceManifest, Problem, AuditEvent and more. Zero runtime dependencies.**

[![Status: planning](https://img.shields.io/badge/status-planning-blueviolet)](https://github.com/vishwajit-vm/strutvane/blob/main/docs/14-roadmap.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Part of Strutvane](https://img.shields.io/badge/ecosystem-Strutvane-1f3a5f)](https://github.com/vishwajit-vm/strutvane)

</div>

> [!NOTE]
> **Status: v0 draft, implemented and tested, but not yet released to npm.** The types follow [RFC-0001](https://github.com/vishwajit-vm/strutvane/blob/main/docs/rfcs/0001-contracts-v0.md) and may still change before `0.1.0`. The version on npm today is only a name placeholder.

## What it is

Strutvane Contracts is part of **[Strutvane](https://github.com/vishwajit-vm/strutvane)**, a TypeScript framework and package ecosystem for building enterprise B2B applications. You declare models as fields and types, and get migrations, a secured CRUD API, auth/RBAC/tenancy and a complete UI. Every line stays owned, overridable TypeScript.

**This package is the shared language between the other packages.** `@strutvane/framework`, `@strutvane/auth` and `@strutvane/ui` never import each other. They all speak these contracts, so each works alone and all work together.

## What's inside (v0)

| Contract | In plain words |
|---|---|
| `Actor`, `Permission` | Who is making the request, and permission strings like `"invoice.approve"` |
| `TenantContext` | Which customer organisation (tenant) the request belongs to |
| `QueryFilter` | A portable "which rows?" tree, shared by auth policies, UI filters and SQL. Its NULL rules are spelled out so in-memory checks and database queries always agree. |
| `ListQuery`, `ListResult` | How a client asks for a page of records (filter, search, sort, cursor/offset paging), and what comes back |
| `PermissionProvider`, `Decision` | The interface auth implements and the framework calls. It is deny-by-default. |
| `Problem` | The single shape of every API error (RFC 9457 + `code`, `traceId`, `fieldErrors`) |
| `ResourceManifest` | A machine-readable description of every resource, which the UI reads to build screens |
| `AuditEvent`, `DomainEvent` | Records of who changed what, and business events like `invoice.sent` |
| `FieldType`, `Installer` | Extension points for custom field types and for `sv add <package>` installers *(draft)* |
| `StandardSchemaV1` | Lets any validator (Zod, Valibot, ArkType…) plug in, with no dependency |

**Guarantees:**
- **Zero runtime dependencies:** only types plus four tiny frozen constants.
- **Strict semver**, with at most one major version per year.
- **Misuse is tested to fail:** type-level tests prove that misuse fails to compile, e.g. comparing against `null` or using a permission without a dot.

## Examples

```ts
import type { Actor, PermissionProvider, QueryFilter } from '@strutvane/contracts'

// "Invoices I own that are not void": one filter, usable in SQL and in memory.
const mine: QueryFilter = {
  op: 'and',
  filters: [
    { op: 'eq', field: 'ownerId', value: { $actor: 'id' } },
    { op: 'ne', field: 'status', value: 'void' },
  ],
}

// A (deliberately simple) permission provider. Real apps use @strutvane/auth.
export const adminsOnly: PermissionProvider = {
  async can(actor: Actor | null) {
    const allowed = actor?.roles.includes('admin') ?? false
    return { allowed, reason: allowed ? 'allow:role=admin' : 'default-deny' }
  },
  async filterFor(actor: Actor | null): Promise<QueryFilter> {
    return actor?.roles.includes('admin') ? { op: 'true' } : { op: 'false' }
  },
}
```

## Installation (once released)

```bash
npm i -D @strutvane/contracts
```

## Development

```bash
corepack pnpm@12.18.0 install
corepack pnpm@12.18.0 run ci   # lint → typecheck → tests (incl. type tests) + coverage → build
```

| Script | What it does |
|---|---|
| `lint` / `format` | Biome check / auto-fix |
| `typecheck` | `tsc --noEmit` with the strictest settings |
| `test` / `test:coverage` | Vitest: runtime tests plus type-level tests (`test/*.test-d.ts`) |
| `build` | tsdown → `dist/index.mjs` + `dist/index.d.mts` |

Shared configs (`tsconfig.base.json`, `biome.base.json`, `vitest.shared.ts`, CI workflows) are synced from [strutvane-tooling](https://github.com/vishwajit-vm/strutvane-tooling). Don't edit them here.

## Works alone, better together

| Package | Role |
|---------|------|
| [`@strutvane/framework`](https://github.com/vishwajit-vm/strutvane-framework) | Backend & database core |
| [`@strutvane/auth`](https://github.com/vishwajit-vm/strutvane-auth) | Authentication, authorization, tenancy, audit |
| [`@strutvane/ui`](https://github.com/vishwajit-vm/strutvane-ui) | Metadata-driven frontend |
| [`@strutvane/core`](https://github.com/vishwajit-vm/strutvane-core) | Kernel: container, providers, config, context |
| [`@strutvane/contracts`](https://github.com/vishwajit-vm/strutvane-contracts) | Shared types and wire protocols |
| [`strutvane` / `@strutvane/cli`](https://github.com/vishwajit-vm/strutvane-cli) | Unified CLI |
| [`@strutvane/devkit`](https://github.com/vishwajit-vm/strutvane-devkit) | SDK for installers, generators and plugins |
| [`@strutvane/logs`](https://github.com/vishwajit-vm/strutvane-logs) | Zero-config logging + built-in log viewer (default) |
| [`create-strutvane`](https://github.com/vishwajit-vm/create-strutvane) | Project starter |

## Documentation

- **Package specification:** [04-architecture.md](https://github.com/vishwajit-vm/strutvane/blob/main/docs/04-architecture.md)
- **Ecosystem blueprint:** [strutvane/docs](https://github.com/vishwajit-vm/strutvane/tree/main/docs), starting with the [executive summary](https://github.com/vishwajit-vm/strutvane/blob/main/docs/00-executive-summary.md) and the [developer experience](https://github.com/vishwajit-vm/strutvane/blob/main/docs/05-developer-experience.md)

## Contributing

Ideas and design feedback are welcome while the project is in the design phase. Open an issue or discussion, and see [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Please report vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 The Strutvane Authors
