import { describe, expect, test } from 'vitest'
import { HTTP_HOOKS } from '../src/index.ts'

describe('HTTP_HOOKS', () => {
  test('names the request and response hooks the framework runs', () => {
    expect(HTTP_HOOKS).toEqual({ request: 'http.onRequest', response: 'http.onResponse' })
  })

  test('names are unique, so a handler can never be registered on the wrong hook', () => {
    const names = Object.values(HTTP_HOOKS)
    expect(new Set(names).size).toBe(names.length)
  })
})
