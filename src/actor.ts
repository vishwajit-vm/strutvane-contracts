/**
 * Who is making a request.
 *
 * Every Strutvane package that needs to know "who is this?" uses {@link Actor}: the framework for
 * `createdBy` columns, auth for permission checks, the UI for showing the current user, the audit
 * log for recording who changed what. An anonymous request has no actor (`null`).
 *
 * @module
 */

/**
 * The kind of actor.
 * - `user`: a person signed in through the UI or an API token tied to a person.
 * - `service`: a machine client (API key, OAuth client credentials, another service).
 * - `system`: Strutvane itself (scheduled jobs, migrations, seeders). Never granted implicitly to
 *   requests. Code must opt in explicitly, and every use is audited.
 */
export type ActorType = 'user' | 'service' | 'system'

/**
 * A permission string: `"<resource>.<action>"` (e.g. `"invoice.approve"`), a resource wildcard
 * (`"invoice.*"`) or the global wildcard (`"*"`).
 *
 * @example
 * const canApprove: Permission = 'invoice.approve'
 */
export type Permission = `${string}.${string}` | '*'

/** The authenticated principal making the current request. */
export interface Actor {
  /** Stable unique id (e.g. a user id or service-account id). Never an email address. */
  readonly id: string
  /** What kind of principal this is. */
  readonly type: ActorType
  /**
   * The tenant the actor is acting in, when multi-tenancy is enabled. Absent for global
   * (platform-level) actors.
   */
  readonly tenantId?: string
  /** Role names the actor holds in the current tenant (or globally), e.g. `["manager"]`. */
  readonly roles: readonly string[]
  /**
   * Pre-resolved permissions, when the identity layer already knows them (e.g. from a token).
   * Absent means "ask the PermissionProvider". It never means "no permissions".
   */
  readonly permissions?: readonly Permission[]
  /**
   * Extra attributes usable in attribute-based rules (department, region, plan, …).
   * Values must be JSON-serialisable.
   */
  readonly attrs: Readonly<Record<string, unknown>>
}
