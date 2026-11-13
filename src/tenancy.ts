/**
 * Which tenant (customer organisation) the current request belongs to.
 *
 * Analogy: one apartment building (your app), many apartments (tenants). Every query must stay
 * inside the current apartment. The framework enforces this with tenant-scoped queries and,
 * on PostgreSQL, row-level security.
 *
 * @module
 */

/**
 * How tenant data is isolated.
 * - `shared`: one schema; every row carries `tenant_id` (default, scales to many tenants).
 * - `schema`: one PostgreSQL schema per tenant.
 * - `database`: one database per tenant (strongest isolation, e.g. data residency).
 */
export type TenantStrategy = 'shared' | 'schema' | 'database'

/** The resolved tenant for the current request. */
export interface TenantContext {
  /** Stable tenant id (UUID recommended). */
  readonly id: string
  /** Isolation strategy used for this tenant. Hybrid apps may mix strategies per tenant. */
  readonly strategy: TenantStrategy
  /** Connection name to use (strategy `database`), as configured in `config/database.ts`. */
  readonly connection?: string
  /** Data-residency region, if the app routes tenants by region (e.g. `"eu-west"`). */
  readonly region?: string
}

/** Strategies in a fixed order (useful for validation and UI pickers). */
export const TENANT_STRATEGIES: readonly TenantStrategy[] = ['shared', 'schema', 'database']
