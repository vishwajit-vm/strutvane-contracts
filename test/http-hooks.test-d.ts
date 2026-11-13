// Type-level tests for the HTTP hook protocol.
import { describe, expectTypeOf, test } from 'vitest'
import type { Actor, HttpRequestHookPayload, HttpResponseHookPayload } from '../src/index.ts'
import { HTTP_HOOKS } from '../src/index.ts'

describe('HttpRequestHookPayload', () => {
  test('clientAddress is an optional string (undefined when the server cannot tell)', () => {
    expectTypeOf<HttpRequestHookPayload['clientAddress']>().toEqualTypeOf<string | undefined>()
  })

  test('actor is explicit: null for anonymous, never undefined', () => {
    expectTypeOf<HttpRequestHookPayload['actor']>().toEqualTypeOf<Actor | null>()
  })

  test('payload fields are read-only, so handlers return a copy instead of mutating', () => {
    const payload: HttpRequestHookPayload = {
      request: new Request('http://localhost/'),
      actor: null,
      tenant: undefined,
    }
    // @ts-expect-error clientAddress is readonly
    payload.clientAddress = '10.0.0.1'
  })

  test('clientAddress must be a string, not a parsed object', () => {
    const bad: HttpRequestHookPayload = {
      request: new Request('http://localhost/'),
      actor: null,
      tenant: undefined,
      // @ts-expect-error clientAddress is a plain address string
      clientAddress: { address: '10.0.0.1' },
    }
    void bad
  })
})

describe('HttpResponseHookPayload', () => {
  test('carries the status and request id', () => {
    expectTypeOf<HttpResponseHookPayload['status']>().toEqualTypeOf<number>()
    expectTypeOf<HttpResponseHookPayload['requestId']>().toEqualTypeOf<string>()
  })
})

describe('HTTP_HOOKS', () => {
  test('hook names are literal types', () => {
    expectTypeOf(HTTP_HOOKS.request).toEqualTypeOf<'http.onRequest'>()
    expectTypeOf(HTTP_HOOKS.response).toEqualTypeOf<'http.onResponse'>()
  })
})
