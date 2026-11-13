/**
 * Every Strutvane API error has the same shape: an RFC 9457 "problem details" object.
 * Clients (including `@strutvane/ui`) can rely on `status`, `code` and `fieldErrors` without
 * guessing.
 *
 * @example
 * {
 *   "type": "https://strutvane.dev/errors/validation",
 *   "title": "Validation failed",
 *   "status": 422,
 *   "code": "VALIDATION_FAILED",
 *   "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
 *   "fieldErrors": { "amount": ["Must be at least 0"] }
 * }
 *
 * @module
 */

/** The media type of problem responses. */
export const PROBLEM_CONTENT_TYPE: 'application/problem+json' = 'application/problem+json'

/** An RFC 9457 problem details object, with Strutvane's standard extensions. */
export interface Problem {
  /** A URI identifying the problem type. Stable; documented on the docs site. */
  readonly type: string
  /** Short, human-readable summary of the problem type (same for every occurrence). */
  readonly title: string
  /** The HTTP status code. */
  readonly status: number
  /** Human-readable explanation of this occurrence. Never contains secrets or stack traces. */
  readonly detail?: string
  /** A URI identifying this occurrence (e.g. the request path). */
  readonly instance?: string
  /** Machine-readable, stable error code in `SCREAMING_SNAKE_CASE`, e.g. `"VALIDATION_FAILED"`. */
  readonly code: string
  /** The OpenTelemetry trace id, so support can find the request in logs. */
  readonly traceId?: string
  /** Validation messages per field path (present for status 422). */
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>
  /** RFC 9457 allows extra members. */
  readonly [extension: string]: unknown
}

/** Well-known problem codes used across Strutvane packages. Apps may add their own. */
export type ProblemCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR'
