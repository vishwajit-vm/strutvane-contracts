/**
 * The bridge between "who is this?" and "may they do that?".
 *
 * `@strutvane/auth` implements {@link PermissionProvider}. `@strutvane/framework` only ever talks
 * to this interface, which is why the two packages never import each other. Any other
 * implementation (OpenFGA, Cerbos, a custom service) can be plugged in the same way.
 *
 * @module
 */
import type { Actor, Permission } from './actor.ts'
import type { QueryFilter } from './query-filter.ts'

/** The result of a permission check. */
export interface Decision {
  /** `true` only when an explicit rule allowed the action and no rule denied it. */
  readonly allowed: boolean
  /**
   * Which rule decided, for audit logs and debugging, e.g. `"allow:role=manager"` or
   * `"default-deny"`. Never contains secrets or personal data.
   */
  readonly reason: string
}

/** What a permission check is about. */
export interface ResourceRef {
  /** Resource type, e.g. `"invoice"`. */
  readonly type: string
  /** The record's id, when checking a specific record. */
  readonly id?: string
  /** The record's current field values, so attribute-based rules can be evaluated in memory. */
  readonly record?: Readonly<Record<string, unknown>>
}

/**
 * Decides permissions. Implementations MUST be deny-by-default: anything not explicitly allowed
 * is denied, and an explicit deny always wins over an allow.
 */
export interface PermissionProvider {
  /**
   * May `actor` perform `action`, optionally on a specific resource?
   * `actor` is `null` for anonymous requests.
   */
  can(
    actor: Actor | null,
    action: Permission,
    resource?: ResourceRef,
    context?: Readonly<Record<string, unknown>>,
  ): Promise<Decision>

  /**
   * The row filter that limits a list query to records `actor` may perform `action` on.
   * Returns `{ op: 'false' }` when nothing is allowed. Never returns a filter that is broader
   * than what {@link PermissionProvider.can} would allow for each individual record.
   */
  filterFor(actor: Actor | null, action: Permission, resourceType: string): Promise<QueryFilter>

  /**
   * The fields of `resourceType` that `actor` may filter, sort and search on. This should equal the
   * fields the actor may read: allowing a filter on a field the actor cannot read would let them
   * infer its values from which records match.
   *
   * Optional, so simple providers stay simple. When a provider omits it, the framework falls back
   * to its own client-queryable fields (which already exclude `hidden` fields). When present, the
   * framework intersects the two and rejects any other field (`filter_not_allowed` / `sort_not_allowed`).
   */
  filterableFields?(actor: Actor | null, resourceType: string): Promise<ReadonlySet<string>>
}
