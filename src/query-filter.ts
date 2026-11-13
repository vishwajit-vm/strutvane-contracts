/**
 * A portable description of "which rows?".
 *
 * One {@link QueryFilter} tree is shared by three producers and two consumers:
 * - **auth policies** produce row filters (e.g. "only invoices you own"),
 * - **UI filter chips** and the **`/query` endpoint** produce user filters,
 * - the **framework** compiles the tree to SQL, and **auth** evaluates it in memory for one record.
 *
 * Because both the SQL path and the in-memory path read the same tree, they must agree. That
 * requires one shared definition of NULL behaviour, written down below and tested in every
 * evaluator.
 *
 * ## NULL semantics (normative)
 * Evaluators MUST follow SQL's rules, so that in-memory checks match database results:
 * - A comparison (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `between`, text operators)
 *   where the field value is `null` is **not satisfied**. So `ne` does NOT match rows whose field
 *   is null.
 * - `isNull` / `isNotNull` are the only operators that match on null.
 * - `not` of an unsatisfied comparison on a null field is **also unsatisfied** (three-valued
 *   logic: NOT UNKNOWN = UNKNOWN). Evaluators therefore track TRUE / FALSE / UNKNOWN internally.
 * - `null` is not allowed as a comparison value. Use `isNull` instead. The types forbid it.
 *
 * @module
 */

/**
 * A dot-separated path to a field, optionally through relations: `"status"`, `"customer.region"`.
 * Only fields a resource declares as filterable may be used; the framework rejects others.
 */
export type FieldPath = string

/** A literal value that can be compared. `null` is deliberately excluded (see NULL semantics). */
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

/** Negation, using three-valued logic (see NULL semantics). */
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
