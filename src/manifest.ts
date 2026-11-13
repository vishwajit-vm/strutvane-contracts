/**
 * The resource manifest: a machine-readable description of every resource an app exposes.
 *
 * The framework builds it from the app's models and serves it at {@link MANIFEST_PATH},
 * filtered to what the current actor may see. `@strutvane/ui` reads it to build tables, forms
 * and menus automatically. SDK generators and docs read it too.
 *
 * @module
 */
import type { Permission } from './actor.ts'
import type { FilterOperator } from './query-filter.ts'

/** Where the manifest is served. */
export const MANIFEST_PATH: '/.well-known/strutvane.json' = '/.well-known/strutvane.json'

/** The manifest format version described by this module. Bumped on breaking changes only. */
export const MANIFEST_VERSION: 1 = 1

/** A JSON Schema document (draft 2020-12), kept opaque here. */
export type JsonSchema = Readonly<Record<string, unknown>>

/**
 * Built-in field types. Custom field types (registered by plugins) use their own names, which
 * is why any string is accepted while the built-ins still autocomplete.
 */
export type FieldTypeName =
  | 'id'
  | 'uuid'
  | 'ulid'
  | 'string'
  | 'text'
  | 'email'
  | 'url'
  | 'phone'
  | 'slug'
  | 'password'
  | 'richText'
  | 'markdown'
  | 'color'
  | 'integer'
  | 'bigInteger'
  | 'decimal'
  | 'float'
  | 'money'
  | 'percent'
  | 'boolean'
  | 'enum'
  | 'set'
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamp'
  | 'duration'
  | 'json'
  | 'array'
  | 'address'
  | 'geoPoint'
  | 'belongsTo'
  | 'hasOne'
  | 'hasMany'
  | 'manyToMany'
  | 'file'
  | 'image'
  | 'files'
  | 'computed'
  | (string & {})

/** How a field relates to another resource. */
export interface RelationDescriptor {
  readonly kind: 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany'
  /** Target resource name, e.g. `"Customer"`. */
  readonly target: string
  /** Foreign-key field on this resource (`belongsTo`) or on the target (`hasOne`/`hasMany`). */
  readonly foreignKey?: string
}

/** Everything a client needs to know about one field. */
export interface FieldDescriptor {
  /** Field name as used in the API, e.g. `"dueDate"`. */
  readonly name: string
  readonly type: FieldTypeName
  /** Human label, e.g. `"Due date"`. */
  readonly label: string
  /** Help text shown under form inputs. */
  readonly help?: string
  readonly required: boolean
  readonly nullable: boolean
  readonly unique: boolean
  /** Can be read but never written through the API. */
  readonly readOnly: boolean
  /** Can be set on create but never changed afterwards. */
  readonly writeOnce: boolean
  /** Operators this field may be filtered with (empty = not filterable). */
  readonly filterOperators: readonly FilterOperator[]
  readonly sortable: boolean
  readonly searchable: boolean
  /** Allowed values for `enum` / `set` fields. */
  readonly enumValues?: readonly string[]
  readonly relation?: RelationDescriptor
  /** Suggested UI widget, e.g. `"textarea"`, `"money"`, `"relation-picker"`. */
  readonly widget?: string
  /** Validation rules as JSON Schema (for client-side validation). */
  readonly schema?: JsonSchema
  /** API version that introduced the field, e.g. `"v2"`. */
  readonly since?: string
  /** Present when the field is deprecated; the message explains what to use instead. */
  readonly deprecated?: string
}

/** A custom action, e.g. "Approve invoice". */
export interface ActionDescriptor {
  readonly name: string
  readonly label: string
  readonly permission: Permission
  /** `record` actions act on one record (`POST /:id/<name>`); `collection` actions on many. */
  readonly scope: 'record' | 'collection'
  /** JSON Schema of the action's input, when it takes any. */
  readonly input?: JsonSchema
  /** Whether the UI should ask for confirmation first. */
  readonly confirm: boolean
  readonly variant?: 'default' | 'primary' | 'danger'
}

/** The standard CRUD capabilities, as allowed for the actor who requested the manifest. */
export interface ResourceCapabilities {
  readonly list: boolean
  readonly view: boolean
  readonly create: boolean
  readonly update: boolean
  readonly delete: boolean
  readonly restore: boolean
  readonly export: boolean
}

/** One resource (model) as exposed by the API. */
export interface ResourceDescriptor {
  /** Model name, e.g. `"Invoice"`. */
  readonly name: string
  /** API path segment, e.g. `"invoices"` (full path: `/api/v1/invoices`). */
  readonly path: string
  readonly label: string
  readonly pluralLabel: string
  /** Field used as the record's display title, e.g. `"number"`. */
  readonly titleField: string
  readonly fields: readonly FieldDescriptor[]
  readonly actions: readonly ActionDescriptor[]
  readonly capabilities: ResourceCapabilities
  readonly softDeletes: boolean
  readonly tenantScoped: boolean
  readonly audited: boolean
  /** Optional UI hints (icon name, sidebar group, default columns). */
  readonly ui?: {
    readonly icon?: string
    readonly group?: string
    readonly listColumns?: readonly string[]
  }
}

/** The whole manifest document. */
export interface ResourceManifest {
  readonly manifestVersion: typeof MANIFEST_VERSION
  readonly app: { readonly name: string; readonly apiVersion: string }
  /** ISO-8601 timestamp of when the manifest was built. */
  readonly generatedAt: string
  readonly resources: readonly ResourceDescriptor[]
}
