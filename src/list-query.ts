/**
 * How a client asks for a page of records, and what it gets back.
 *
 * On the wire (REST) this becomes query parameters such as
 * `?filter[status][in]=draft,sent&sort=-dueDate&page[size]=25&page[cursor]=…`. Parsing and
 * serialising that format is the framework's job; this module defines the parsed, typed shape
 * both sides agree on.
 *
 * @module
 */
import type { FieldPath, QueryFilter } from './query-filter.ts'

/** Sort order for one field. */
export interface SortDirective {
  readonly field: FieldPath
  readonly direction: 'asc' | 'desc'
}

/**
 * Which page to return.
 * - `cursor` (default, recommended): stable under inserts, fast on large tables.
 * - `offset`: page numbers, for UIs that need "jump to page 7".
 */
export type PageRequest =
  | { readonly kind: 'cursor'; readonly size: number; readonly cursor?: string }
  | { readonly kind: 'offset'; readonly size: number; readonly number: number }

/** A parsed list request. Every part is optional; the server applies defaults. */
export interface ListQuery {
  /** Row filter (combined with tenant scope and policy filters on the server). */
  readonly filter?: QueryFilter
  /** Free-text search across the resource's searchable fields. */
  readonly search?: string
  /** Sort order. The server always appends a stable tiebreaker (the id). */
  readonly sort?: readonly SortDirective[]
  /** Pagination. Defaults to `{ kind: 'cursor', size: LIST_QUERY_LIMITS.defaultPageSize }`. */
  readonly page?: PageRequest
  /** Relations to embed, e.g. `["customer", "lines"]`. Must be allow-listed by the resource. */
  readonly include?: readonly string[]
  /** Sparse fieldsets per resource type, e.g. `{ invoices: ["id", "number"] }`. */
  readonly fields?: Readonly<Record<string, readonly string[]>>
}

/** Information about the returned page. */
export interface PageInfo {
  /** Page size used. */
  readonly size: number
  /** Whether another page exists after this one. */
  readonly hasMore: boolean
  /** Cursor for the next page (cursor pagination). */
  readonly nextCursor?: string
  /** Page number (offset pagination). */
  readonly number?: number
  /** Total matching rows. Only present when explicitly requested (counting can be expensive). */
  readonly total?: number
}

/** The response body of a list endpoint. */
export interface ListResult<TRecord> {
  readonly data: readonly TRecord[]
  readonly meta: { readonly page: PageInfo }
  readonly links?: { readonly next?: string; readonly prev?: string }
}

/** Server-side pagination limits. Apps may lower `maxPageSize`, never exceed it. */
export interface ListQueryLimits {
  readonly defaultPageSize: number
  readonly maxPageSize: number
}

/** Default pagination limits. */
export const LIST_QUERY_LIMITS: ListQueryLimits = Object.freeze({
  defaultPageSize: 25,
  maxPageSize: 100,
})
