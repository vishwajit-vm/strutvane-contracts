import { describe, expect, test } from 'vitest'
import {
  FILTER_OPERATORS,
  type FilterOperator,
  LIST_QUERY_LIMITS,
  MANIFEST_PATH,
  MANIFEST_VERSION,
  PROBLEM_CONTENT_TYPE,
  TENANT_STRATEGIES,
  type TenantStrategy,
} from '../src/index.ts'

describe('FILTER_OPERATORS', () => {
  // A Record over the union forces this object to list every operator. If an operator is added
  // to the FilterOperator type but not here, TypeScript fails, and if it is not added to
  // FILTER_OPERATORS, the assertion below fails.
  const every: Record<FilterOperator, true> = {
    eq: true,
    ne: true,
    gt: true,
    gte: true,
    lt: true,
    lte: true,
    in: true,
    nin: true,
    isNull: true,
    isNotNull: true,
    contains: true,
    startsWith: true,
    endsWith: true,
    between: true,
  }

  test('lists every FilterOperator exactly once', () => {
    expect([...FILTER_OPERATORS].sort()).toEqual(Object.keys(every).sort())
    expect(new Set(FILTER_OPERATORS).size).toBe(FILTER_OPERATORS.length)
  })
})

describe('TENANT_STRATEGIES', () => {
  const every: Record<TenantStrategy, true> = { shared: true, schema: true, database: true }

  test('lists every TenantStrategy exactly once, in documented order', () => {
    expect(TENANT_STRATEGIES).toEqual(['shared', 'schema', 'database'])
    expect([...TENANT_STRATEGIES].sort()).toEqual(Object.keys(every).sort())
  })
})

describe('LIST_QUERY_LIMITS', () => {
  test('has safe defaults: default page fits inside the maximum', () => {
    expect(LIST_QUERY_LIMITS.defaultPageSize).toBe(25)
    expect(LIST_QUERY_LIMITS.maxPageSize).toBe(100)
    expect(LIST_QUERY_LIMITS.defaultPageSize).toBeLessThanOrEqual(LIST_QUERY_LIMITS.maxPageSize)
  })

  test('is frozen, so no package can change the shared defaults at runtime', () => {
    expect(Object.isFrozen(LIST_QUERY_LIMITS)).toBe(true)
  })
})

describe('wire constants', () => {
  test('match the documented protocol values', () => {
    expect(PROBLEM_CONTENT_TYPE).toBe('application/problem+json')
    expect(MANIFEST_PATH).toBe('/.well-known/strutvane.json')
    expect(MANIFEST_VERSION).toBe(1)
  })
})
