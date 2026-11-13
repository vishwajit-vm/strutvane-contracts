/**
 * A portable description of "which rows?".
 *
 * One {@link QueryFilter} tree is shared by three producers and two consumers:
 * - **auth policies** produce row filters (e.g. "only invoices you own"),
 * - **UI filter chips** and the **`/query` endpoint** produce user filters,
 * - the **framework** compiles the tree to SQL, and **auth** evaluates it in memory for one record.
 *
 * Because both the SQL path and the in-memory path read the same tree, they must agree. That
 * requires one shared definition of NULL behaviour, written down below and enforced in every
 * evaluator by a property-based equivalence test (Phase 0 spike 02: 43,930 comparisons, 0
 * mismatches).
 *
 * ## Semantics (normative): two-valued and NULL-safe
 * Every operator yields exactly `true` or `false`, never "unknown", so `not` is a plain negation
 * in both paths. With `v` the field value:
 * - `eq`: `true` only when `v` is non-null and equal. `ne` is the exact negation of `eq`, so
 *   **`ne` matches rows whose field is null**. (This makes `deny … when status ne 'paid'` protect
 *   rows with no status, where SQL's native `<>` would silently skip them.)
 * - `gt`, `gte`, `lt`, `lte`, `between`: `false` when `v` is null. Only allowed on numeric (and,
 *   later, temporal) fields, because text ordering depends on database collation.
 * - `in`: `true` when `v` is non-null and equals a listed value. `nin` is its exact negation
 *   (so it matches null). An empty list makes `in` false and `nin` true.
 * - `contains`, `startsWith`, `endsWith`: `false` when `v` is null; the search text is matched
 *   literally (`%` and `_` are not wildcards).
 * - `isNull` / `isNotNull` test for null directly.
 * - `null` is not allowed as a comparison value. Use `isNull` instead (the types forbid it).
 *
 * ## Actor references (normative, security)
 * {@link ActorRef}s are replaced by the actor's values *before* evaluation or SQL compilation:
 * - If the actor's value is `null`, `eq` becomes `false`, `ne` becomes `true`, and the value is
 *   dropped from `in` / `nin` lists. A null actor attribute must never match null rows (otherwise
 *   "same region as me" would grant every row without a region to an actor without a region).
 * - If the actor attribute is missing (`undefined`), evaluation MUST throw. Identity providers
 *   must set every attribute that policies reference, explicitly, even if to `null`.
 *
 * ## Fail closed
 * Inputs the two paths could disagree on are rejected identically by both: unknown fields, a value
 * whose type does not match the field, ordering on non-numeric fields, and strings containing
 * U+0000. When evaluating in memory, a field missing from the record (not loaded) throws rather
 * than being read as null.
 *
 * @module
 */

/**
 * A dot-separated path to a field, optionally through relations: `"status"`, `"customer.region"`.
 * Only fields a resource declares as filterable may be used; the framework rejects others.
 */
export type FieldPath = string

/** A literal value that can be compared. `null` is deliberately excluded (use `isNull`). */
export type FilterScalar = string | number | boolean

/**
 * A reference to a property of the current actor, resolved at evaluation time. This lets one
 * policy say "rows whose ownerId equals my id" without being re-written per user.
 *
 * @example
 * const mine: QueryFilter = { op: 'eq', field: 'ownerId', value: { $actor: 'id' } }
 */
export interface ActorRef {
  /** `"id"`, `"tenantId"`, or an attribute such as `"attrs.region"`. */
  readonly $actor: 'id' | 'tenantId' | `attrs.${string}`
}

/** Anything that can appear on the right-hand side of a comparison. */
export type FilterOperand = FilterScalar | ActorRef

/** Logical operators that combine other filters. */
export type LogicalOperator = 'and' | 'or' | 'not'
/** Binary comparisons. */
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
/** Set membership. */
export type SetOperator = 'in' | 'nin'
/** Null checks. */
export type NullOperator = 'isNull' | 'isNotNull'
/** Text matching. */
export type TextOperator = 'contains' | 'startsWith' | 'endsWith'
/** Every operator a field can be filtered with (`between` included). */
export type FilterOperator =
  | ComparisonOperator
  | SetOperator
  | NullOperator
  | TextOperator
  | 'between'

/** All filters are true. An empty `filters` list is TRUE. */
export interface AndFilter {
  readonly op: 'and'
  readonly filters: readonly QueryFilter[]
}

/** At least one filter is true. An empty `filters` list is FALSE. */
export interface OrFilter {
  readonly op: 'or'
  readonly filters: readonly QueryFilter[]
}

/** Plain negation (semantics are two-valued, so `not` never has to handle "unknown"). */
export interface NotFilter {
  readonly op: 'not'
  readonly filter: QueryFilter
}

/** `field <op> value`. */
export interface ComparisonFilter {
  readonly op: ComparisonOperator
  readonly field: FieldPath
  readonly value: FilterOperand
}

/** `field IN (values)` / `field NOT IN (values)`. An empty list: `in` is FALSE, `nin` is TRUE. */
export interface SetFilter {
  readonly op: SetOperator
  readonly field: FieldPath
  readonly values: readonly FilterOperand[]
}

/** `field IS NULL` / `field IS NOT NULL`. */
export interface NullFilter {
  readonly op: NullOperator
  readonly field: FieldPath
}

/** Substring / prefix / suffix match on text fields. Case-insensitive unless stated. */
export interface TextFilter {
  readonly op: TextOperator
  readonly field: FieldPath
  /** The text to look for. Wildcard characters (`%`, `_`) are matched literally. */
  readonly value: string
  /** Defaults to `false` (case-insensitive). */
  readonly caseSensitive?: boolean
}

/** `from <= field <= to` (inclusive on both ends). */
export interface BetweenFilter {
  readonly op: 'between'
  readonly field: FieldPath
  readonly from: FilterOperand
  readonly to: FilterOperand
}

/** A constant. `{ op: 'false' }` is how "deny by default" is expressed. */
export interface ConstantFilter {
  readonly op: 'true' | 'false'
}

/** The filter tree. Discriminate on `op`. */
export type QueryFilter =
  | AndFilter
  | OrFilter
  | NotFilter
  | ComparisonFilter
  | SetFilter
  | NullFilter
  | TextFilter
  | BetweenFilter
  | ConstantFilter

/** Every field operator, in a fixed order (for validation, docs and UI operator pickers). */
export const FILTER_OPERATORS: readonly FilterOperator[] = [
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'isNull',
  'isNotNull',
  'contains',
  'startsWith',
  'endsWith',
  'between',
]
