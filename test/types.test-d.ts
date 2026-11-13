// Type-level tests: these run through the TypeScript compiler (vitest typecheck mode). A line marked
// `@ts-expect-error` FAILS the test run if it ever starts compiling, which proves the contract
// rejects that misuse.
import { describe, expectTypeOf, test } from 'vitest'
import { z } from 'zod'
import type {
  Actor,
  DomainEvent,
  InferOutput,
  ListQuery,
  Permission,
  PermissionProvider,
  Problem,
  QueryFilter,
  ResourceManifest,
  StandardSchemaV1,
} from '../src/index.ts'

describe('Permission', () => {
  test('accepts resource.action, resource wildcards and the global wildcard', () => {
    expectTypeOf<'invoice.approve'>().toExtend<Permission>()
    expectTypeOf<'invoice.*'>().toExtend<Permission>()
    expectTypeOf<'*'>().toExtend<Permission>()
  })

  test('rejects strings without a dot', () => {
    // @ts-expect-error a permission must be "<resource>.<action>"
    const bad: Permission = 'approve'
    void bad
  })
})

describe('QueryFilter', () => {
  test('models nested logic with actor references', () => {
    const filter: QueryFilter = {
      op: 'and',
      filters: [
        { op: 'eq', field: 'ownerId', value: { $actor: 'id' } },
        { op: 'not', filter: { op: 'in', field: 'status', values: ['void', 'paid'] } },
        { op: 'between', field: 'amount', from: 0, to: 10_000 },
        { op: 'contains', field: 'customer.name', value: 'acme' },
        { op: 'isNull', field: 'deletedAt' },
      ],
    }
    expectTypeOf(filter).toExtend<QueryFilter>()
  })

  test('forbids null as a comparison value (use isNull instead)', () => {
    // @ts-expect-error null is not a FilterOperand
    const bad: QueryFilter = { op: 'eq', field: 'deletedAt', value: null }
    void bad
  })

  test('forbids unknown operators and missing fields', () => {
    // @ts-expect-error "like" is not an operator
    const unknownOp: QueryFilter = { op: 'like', field: 'name', value: 'a%' }
    // @ts-expect-error comparison filters need a field
    const noField: QueryFilter = { op: 'eq', value: 1 }
    void unknownOp
    void noField
  })

  test('only allows documented actor references', () => {
    const ok: QueryFilter = { op: 'eq', field: 'region', value: { $actor: 'attrs.region' } }
    // @ts-expect-error actor references are id, tenantId or attrs.*
    const bad: QueryFilter = { op: 'eq', field: 'region', value: { $actor: 'email' } }
    void ok
    void bad
  })
})

describe('StandardSchemaV1', () => {
  test('a real Zod 4 schema satisfies the contract structurally (no import of contracts needed)', () => {
    const schema = z.object({ amount: z.number().min(0) })
    expectTypeOf(schema).toExtend<StandardSchemaV1<unknown, { amount: number }>>()
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<{ amount: number }>()
  })
})

describe('Problem', () => {
  test('requires the standard members and allows RFC 9457 extension members', () => {
    const problem: Problem = {
      type: 'https://strutvane.dev/errors/validation',
      title: 'Validation failed',
      status: 422,
      code: 'VALIDATION_FAILED',
      fieldErrors: { amount: ['Must be at least 0'] },
      retryAfterSeconds: 30,
    }
    expectTypeOf(problem.status).toEqualTypeOf<number>()
    // @ts-expect-error `code` is required
    const missingCode: Problem = { type: 'x', title: 'x', status: 500 }
    void missingCode
  })
})

describe('Actor and PermissionProvider', () => {
  test('providers accept anonymous (null) actors and return decisions', () => {
    expectTypeOf<PermissionProvider['can']>().parameter(0).toEqualTypeOf<Actor | null>()
    expectTypeOf<
      Awaited<ReturnType<PermissionProvider['filterFor']>>
    >().toEqualTypeOf<QueryFilter>()
  })

  test('actor collections are readonly (no accidental mutation of the current actor)', () => {
    expectTypeOf<Actor['roles']>().toEqualTypeOf<readonly string[]>()
  })
})

describe('ListQuery', () => {
  test('cursor and offset pagination are distinct shapes', () => {
    const cursor: ListQuery = { page: { kind: 'cursor', size: 25, cursor: 'abc' } }
    const offset: ListQuery = { page: { kind: 'offset', size: 25, number: 3 } }
    // @ts-expect-error offset pagination needs a page number, not a cursor
    const mixed: ListQuery = { page: { kind: 'offset', size: 25, cursor: 'abc' } }
    void cursor
    void offset
    void mixed
  })
})

describe('DomainEvent', () => {
  test('carries a typed event name and payload', () => {
    type InvoiceSent = DomainEvent<'invoice.sent', { invoiceId: string }>
    expectTypeOf<InvoiceSent['type']>().toEqualTypeOf<'invoice.sent'>()
    expectTypeOf<InvoiceSent['payload']>().toEqualTypeOf<{ invoiceId: string }>()
  })
})

describe('ResourceManifest', () => {
  test('pins the manifest format version', () => {
    expectTypeOf<ResourceManifest['manifestVersion']>().toEqualTypeOf<1>()
  })
})
