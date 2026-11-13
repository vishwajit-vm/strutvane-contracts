/**
 * The extension point for custom field types (e.g. `money`, `phone`, `geoPoint` from a plugin).
 *
 * A field type answers every question the framework and UI will ask about a field: how to store
 * it, how to validate it, how to document it, how to filter it and how to show it. That is why
 * adding a field type is enough to make a new kind of field work end-to-end.
 *
 * Status: **draft (v0)**. The column description will be refined after the migration-engine
 * spike (Phase 0, spike 01).
 *
 * @module
 */
import type { JsonSchema } from './manifest.ts'
import type { FilterOperator } from './query-filter.ts'
import type { StandardSchemaV1 } from './standard-schema.ts'

/** SQL dialects Strutvane generates schema for. */
export type SqlDialect = 'postgres' | 'mysql' | 'sqlite'

/** A dialect-specific column definition. */
export interface ColumnSpec {
  /** SQL type, e.g. `"numeric(12,2)"`, `"text"`, `"jsonb"`. */
  readonly sqlType: string
  /** Extra constraint SQL, e.g. a CHECK for enums on dialects without native enums. */
  readonly check?: string
}

/** A field type definition. `TValue` is the TypeScript type of the field's value. */
export interface FieldType<TValue = unknown, TOptions = Readonly<Record<string, unknown>>> {
  /** Unique name, e.g. `"money"`. Plugins should prefix: `"acme.vat-number"`. */
  readonly name: string
  /** How to store the value, per dialect. */
  column(dialect: SqlDialect, options: TOptions): ColumnSpec
  /** Runtime validator for input values (any Standard Schema library). */
  validator(options: TOptions): StandardSchemaV1<unknown, TValue>
  /** JSON Schema for OpenAPI docs and client-side validation. */
  jsonSchema(options: TOptions): JsonSchema
  /** Operators this type supports in filters. */
  readonly filterOperators: readonly FilterOperator[]
  /** Default UI widget name. */
  readonly widget?: string
}
