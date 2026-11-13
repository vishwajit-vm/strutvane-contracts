<div align="center">

# Strutvane Contracts

**Shared TypeScript types and wire protocols that let Strutvane packages integrate without depending on each other: Actor, Tenant, Permission, QueryFilter, ListQuery, ResourceManifest, Problem, AuditEvent and more. Zero runtime dependencies.**

[![Status: planning](https://img.shields.io/badge/status-planning-blueviolet)](https://github.com/vishwajit-vm/strutvane/blob/main/docs/14-roadmap.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Part of Strutvane](https://img.shields.io/badge/ecosystem-Strutvane-1f3a5f)](https://github.com/vishwajit-vm/strutvane)

</div>

> [!NOTE]
> **Strutvane Contracts is in the design phase.** The specification is written and implementation has not started. Nothing is published to npm yet, and the package name `@strutvane/contracts` is reserved for this project. Follow [the roadmap](https://github.com/vishwajit-vm/strutvane/blob/main/docs/14-roadmap.md) for progress.

## What it is

Strutvane Contracts is part of **[Strutvane](https://github.com/vishwajit-vm/strutvane)**, a TypeScript framework and package ecosystem for building enterprise B2B applications. You declare models as fields and types, and get migrations, a secured CRUD API, auth/RBAC/tenancy and a complete UI. Every line stays owned, overridable TypeScript.

## Planned capabilities

- `Actor`, `TenantContext`, `PermissionProvider` / `Decision`
- `QueryFilter` AST: one portable predicate tree shared by auth policies, UI filters and SQL
- `ListQuery` wire protocol for filter, sort, pagination, include, fields and search
- `ResourceManifest`, served at `/.well-known/strutvane.json` and as `x-strutvane-*` OpenAPI extensions
- `Problem` (RFC 9457), `AuditEvent`, `DomainEvent`
- `Installer` and `FieldType` protocols for packages and plugins
- **Zero runtime dependencies**, strict semver, at most one major per year

## A taste of the API (design preview)

```ts
import type { Actor, PermissionProvider, QueryFilter } from '@strutvane/contracts'

export const myProvider: PermissionProvider = {
  async can(actor: Actor, action, resource) { /* … */ return { allowed: true, reason: 'role:admin' } },
  async filterFor(actor, action, model): Promise<QueryFilter> { return { eq: ['tenantId', actor.tenantId] } },
}
```

## Installation (once released)

```bash
npm i -D @strutvane/contracts
```

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
