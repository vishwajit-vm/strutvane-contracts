/**
 * Every Strutvane API error has the same shape: an RFC 9457 "problem details" object with
 * Strutvane's extensions ([RFC-0003](https://github.com/vishwajit-vm/strutvane/blob/main/docs/rfcs/0003-errors-and-messages.md)).
 * Clients (including `@strutvane/ui`) rely on `status`, `code` and `issues` without guessing.
 *
 * @example
 * {
 *   "type": "https://strutvane.dev/errors/validation",
 *   "title": "Validation failed",
 *   "status": 422,
 *   "code": "VALIDATION_FAILED",
 *   "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
 *   "issues": [
 *     { "path": ["amount"], "code": "too_small", "params": { "min": 0 }, "message": "Amount must be at least 0." }
 *   ],
 *   "fieldErrors": { "amount": ["Amount must be at least 0."] }
 * }
 *
 * @module
 */

/** The media type of problem responses. */
export const PROBLEM_CONTENT_TYPE: 'application/problem+json' = 'application/problem+json'

/** A value allowed in issue parameters (rendered into messages, e.g. `{ min: 0 }`). */
export type IssueParam = string | number | boolean

/**
 * One validation problem, structured so that clients can place it on the right field, translate
 * it, or react to its code, instead of parsing a sentence.
 */
export interface ValidationIssue {
  /**
   * Where the problem is: `["lines", 2, "amount"]` points at the third line's amount.
   * An empty path `[]` means the whole form (e.g. a cross-field rule).
   */
  readonly path: readonly (string | number)[]
  /** Stable, machine-readable code in `snake_case`, e.g. `"too_small"`, `"required"`, `"unique"`. */
  readonly code: string
  /** Values used in the message, e.g. `{ min: 0 }`. Never contains secrets. */
  readonly params?: Readonly<Record<string, IssueParam>>
  /** The message, already rendered in the request's locale from the message catalog. */
  readonly message: string
}

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
  /** Structured validation issues (status 422, file errors, …). The source of truth. */
  readonly issues?: readonly ValidationIssue[]
  /**
   * Convenience map derived from {@link Problem.issues}: messages per dotted field path
   * (`"lines.2.amount"`). Kept for simple clients; prefer `issues`.
   */
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>
  /** RFC 9457 allows extra members. */
  readonly [extension: string]: unknown
}

/** Well-known problem codes used across Strutvane packages. Apps and plugins may add their own. */
export type ProblemCode =
  // General (RFC-0003 §4)
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'STALE_RECORD'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  // Files and uploads (RFC-0002 §4)
  | 'FILE_TOO_LARGE'
  | 'TOO_MANY_FILES'
  | 'FILE_EMPTY'
  | 'FILE_TYPE_NOT_ALLOWED'
  | 'FILE_CORRUPT'
  | 'IMAGE_DIMENSIONS_INVALID'
  | 'UPLOAD_INCOMPLETE'
  | 'STORAGE_UNAVAILABLE'
  | 'QUOTA_EXCEEDED'
  | 'FILE_INFECTED'
  | 'SCAN_UNAVAILABLE'

/** Every well-known problem code, in a fixed order (for registries, docs and exhaustiveness tests). */
export const PROBLEM_CODES: readonly ProblemCode[] = [
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'STALE_RECORD',
  'RATE_LIMITED',
  'PAYLOAD_TOO_LARGE',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
  'FILE_TOO_LARGE',
  'TOO_MANY_FILES',
  'FILE_EMPTY',
  'FILE_TYPE_NOT_ALLOWED',
  'FILE_CORRUPT',
  'IMAGE_DIMENSIONS_INVALID',
  'UPLOAD_INCOMPLETE',
  'STORAGE_UNAVAILABLE',
  'QUOTA_EXCEEDED',
  'FILE_INFECTED',
  'SCAN_UNAVAILABLE',
]
