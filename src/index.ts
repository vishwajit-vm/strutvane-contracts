/**
 * `@strutvane/contracts`: the shared language of the Strutvane ecosystem.
 *
 * Types and wire protocols only, with zero runtime dependencies. Packages like
 * `@strutvane/framework`, `@strutvane/auth` and `@strutvane/ui` never import each other; they all
 * depend on these contracts instead, which is what lets each one work alone and all of them work
 * together.
 *
 * Status: **v0 draft**. See RFC-0001 in the Strutvane blueprint.
 *
 * @packageDocumentation
 */
export type { Actor, ActorType, Permission } from './actor.ts'
export type {
  ActorStamp,
  AuditEvent,
  DomainEvent,
  FieldChange,
} from './events.ts'
export type { ColumnSpec, FieldType, SqlDialect } from './field-type.ts'
export type { HttpRequestHookPayload, HttpResponseHookPayload } from './http-hooks.ts'
export { HTTP_HOOKS } from './http-hooks.ts'
export type {
  EnvVar,
  InstallConfig,
  InstallContext,
  InstallDeps,
  InstallEnv,
  Installer,
  InstallFs,
  InstallLogger,
} from './installer.ts'
export type {
  ListQuery,
  ListQueryLimits,
  ListResult,
  PageInfo,
  PageRequest,
  SortDirective,
} from './list-query.ts'
export { LIST_QUERY_LIMITS } from './list-query.ts'
export type { LogError, LogFields, Logger, LogLevel, LogRecord } from './logger.ts'
export { LOG_LEVEL_SEVERITY, LOG_LEVELS } from './logger.ts'
export type {
  ActionDescriptor,
  FieldDescriptor,
  FieldTypeName,
  JsonSchema,
  RelationDescriptor,
  ResourceCapabilities,
  ResourceDescriptor,
  ResourceManifest,
} from './manifest.ts'
export { MANIFEST_PATH, MANIFEST_VERSION } from './manifest.ts'
export type { Decision, PermissionProvider, ResourceRef } from './permission.ts'
export type { IssueParam, Problem, ProblemCode, ValidationIssue } from './problem.ts'
export { PROBLEM_CODES, PROBLEM_CONTENT_TYPE } from './problem.ts'
export type {
  ActorRef,
  AndFilter,
  BetweenFilter,
  ComparisonFilter,
  ComparisonOperator,
  ConstantFilter,
  FieldPath,
  FilterOperand,
  FilterOperator,
  FilterScalar,
  LogicalOperator,
  NotFilter,
  NullFilter,
  NullOperator,
  OrFilter,
  QueryFilter,
  SetFilter,
  SetOperator,
  TextFilter,
  TextOperator,
} from './query-filter.ts'
export { FILTER_OPERATORS } from './query-filter.ts'
export type {
  InferInput,
  InferOutput,
  StandardSchemaV1,
  StandardSchemaV1FailureResult,
  StandardSchemaV1Issue,
  StandardSchemaV1PathSegment,
  StandardSchemaV1Props,
  StandardSchemaV1Result,
  StandardSchemaV1SuccessResult,
  StandardSchemaV1Types,
} from './standard-schema.ts'
export type {
  FileBody,
  FileListPage,
  FileVisibility,
  PutOptions,
  StorageDisk,
  StoredFile,
} from './storage.ts'
export type { TenantContext, TenantStrategy } from './tenancy.ts'
export { TENANT_STRATEGIES } from './tenancy.ts'
