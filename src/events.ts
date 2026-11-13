/**
 * Two kinds of events flow through a Strutvane app:
 * - {@link AuditEvent}: a permanent record of *who did what, when, to which record*. It is written
 *   in the same database transaction as the change, so audit and data can never disagree.
 * - {@link DomainEvent}: a business fact ("invoice.sent") that other parts of the system react to
 *   (emails, webhooks, search indexing). It is delivered through an outbox, so it is never lost.
 *
 * @module
 */
import type { ActorType } from './actor.ts'

/** The minimum actor information stored with an event (no roles/attributes, no personal data). */
export interface ActorStamp {
  readonly id: string
  readonly type: ActorType
}

/** One field that changed. Sensitive fields are redacted. */
export interface FieldChange {
  readonly field: string
  readonly from: unknown
  readonly to: unknown
  /** `true` when values were removed because the field is marked sensitive. */
  readonly redacted?: boolean
}

/** A permanent audit record. */
export interface AuditEvent {
  /** Unique, time-sortable id (UUIDv7 recommended). */
  readonly id: string
  /** ISO-8601 timestamp (UTC). */
  readonly occurredAt: string
  /** Who did it. `null` for anonymous actions (e.g. a failed login attempt). */
  readonly actor: ActorStamp | null
  readonly tenantId?: string
  /** What happened, e.g. `"invoice.update"`, `"auth.login.failed"`, `"role.assign"`. */
  readonly action: string
  readonly resource?: { readonly type: string; readonly id?: string }
  /** Field-level changes for updates. */
  readonly changes?: readonly FieldChange[]
  /** Why, when known (e.g. the policy reason for a denied action, or a user-supplied comment). */
  readonly reason?: string
  readonly requestId?: string
  readonly traceId?: string
  /** Client IP address. Store only where your privacy policy allows. */
  readonly ip?: string
  readonly userAgent?: string
}

/** A business event for other parts of the system to react to. */
export interface DomainEvent<TType extends string = string, TPayload = unknown> {
  /** Unique id (UUIDv7 recommended). */
  readonly id: string
  /** Event name in `resource.pastTenseVerb` form, e.g. `"invoice.sent"`. */
  readonly type: TType
  /** Payload schema version. Bump when the payload changes incompatibly. */
  readonly version: number
  readonly payload: TPayload
  /** ISO-8601 timestamp (UTC). */
  readonly occurredAt: string
  readonly tenantId?: string
  readonly actor?: ActorStamp
  /** Consumers use this to ignore duplicates (delivery is at-least-once). */
  readonly idempotencyKey: string
  /** Links events caused by the same request or workflow. */
  readonly correlationId?: string
}
