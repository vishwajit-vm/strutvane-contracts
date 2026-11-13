# @strutvane/contracts

## 0.1.0-next.0

### Minor Changes

- Add the contracts from the accepted RFCs:
  - RFC-0003: `ValidationIssue`, `Problem.issues`, and an extended `ProblemCode` list with a matching `PROBLEM_CODES` constant.
  - RFC-0004: `Logger`, `LogRecord`, `LogLevel`, `LOG_LEVELS` and `LOG_LEVEL_SEVERITY`.
  - RFC-0002: `StorageDisk`, `StoredFile`, `PutOptions`, `FileBody` and `FileVisibility`.
  - Installer protocol: removal operations for `sv remove` (`InstallFs.remove`, `InstallEnv.remove`, `InstallDeps.remove`, `InstallConfig.unregisterProvider`).
  - Text matching: case-insensitive comparison folds ASCII A–Z only, so in-memory and SQL evaluation always agree.
- afb2956: Initial v0 contracts: Actor, Permission, TenantContext, QueryFilter (with normative NULL semantics), ListQuery/ListResult, PermissionProvider/Decision, Problem (RFC 9457), ResourceManifest, AuditEvent, DomainEvent, draft FieldType and Installer protocols, and the Standard Schema v1 interface.
