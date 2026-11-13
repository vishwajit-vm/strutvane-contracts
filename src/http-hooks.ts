/**
 * The HTTP hook protocol: how packages such as `@strutvane/auth` and `@strutvane/logs` take part in
 * every request handled by `@strutvane/framework` without importing it.
 *
 * The framework runs the {@link HTTP_HOOKS} for each request. Handlers receive these payloads and may
 * return a changed copy. Keeping the payload shapes here (instead of in the framework) means both
 * sides compile against one definition, so a field added on one side cannot silently go missing on
 * the other.
 *
 * Status: **draft (v0)**.
 *
 * @module
 */
import type { Actor } from './actor.ts'
import type { TenantContext } from './tenancy.ts'

/** Hook names run by the HTTP layer for every request. */
export const HTTP_HOOKS: {
  readonly request: 'http.onRequest'
  readonly response: 'http.onResponse'
} = {
  request: 'http.onRequest',
  response: 'http.onResponse',
} as const

/**
 * The `http.onRequest` hook payload. Handlers may:
 * - set `actor` / `tenant` to identify the caller;
 * - add `headers` (e.g. a refreshed session cookie) to the eventual response;
 * - set `response` to answer the request themselves (e.g. sign-in routes, the log viewer). The
 *   answer still gets security headers, the request id and `http.onResponse`, but skips routing and
 *   the framework body limit, so such handlers must cap request bodies themselves.
 */
export interface HttpRequestHookPayload {
  readonly request: Request
  readonly actor: Actor | null
  readonly tenant: TenantContext | undefined
  /**
   * The address of the directly connected peer (the TCP socket's remote address), when the server
   * knows it. It is never read from request headers such as `X-Forwarded-For`, because any client
   * can set those. Security controls keyed by client address (per-IP rate limits, IP allow-lists)
   * must use this field; when it is `undefined` they must fail closed (for example, fall back to a
   * shared global limit) rather than skip the check.
   */
  readonly clientAddress?: string
  readonly headers?: Headers
  readonly response?: Response
}

/** The `http.onResponse` hook payload. Observe only: changes are ignored. */
export interface HttpResponseHookPayload {
  readonly request: Request
  readonly status: number
  readonly requestId: string
}
