import { describe, expect, test } from 'vitest'
import {
  LOG_LEVEL_SEVERITY,
  LOG_LEVELS,
  type LogLevel,
  PROBLEM_CODES,
  type ProblemCode,
} from '../src/index.ts'

describe('LOG_LEVELS / LOG_LEVEL_SEVERITY', () => {
  const every: Record<LogLevel, true> = {
    trace: true,
    debug: true,
    info: true,
    warn: true,
    error: true,
    fatal: true,
  }

  test('lists every level exactly once, in ascending severity', () => {
    expect([...LOG_LEVELS].sort()).toEqual(Object.keys(every).sort())
    const severities = LOG_LEVELS.map((l) => LOG_LEVEL_SEVERITY[l])
    expect(severities).toEqual([...severities].sort((a, b) => a - b))
    expect(new Set(severities).size).toBe(severities.length)
  })

  test('uses the pino/bunyan numbering and is frozen', () => {
    expect(LOG_LEVEL_SEVERITY).toEqual({
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    })
    expect(Object.isFrozen(LOG_LEVEL_SEVERITY)).toBe(true)
  })
})

describe('PROBLEM_CODES', () => {
  // A Record over the union forces every code to be listed here; the assertion keeps the runtime
  // list in sync with the type (RFC-0002 + RFC-0003 codes).
  const every: Record<ProblemCode, true> = {
    VALIDATION_FAILED: true,
    UNAUTHENTICATED: true,
    FORBIDDEN: true,
    NOT_FOUND: true,
    CONFLICT: true,
    STALE_RECORD: true,
    RATE_LIMITED: true,
    PAYLOAD_TOO_LARGE: true,
    SERVICE_UNAVAILABLE: true,
    INTERNAL_ERROR: true,
    FILE_TOO_LARGE: true,
    TOO_MANY_FILES: true,
    FILE_EMPTY: true,
    FILE_TYPE_NOT_ALLOWED: true,
    FILE_CORRUPT: true,
    IMAGE_DIMENSIONS_INVALID: true,
    UPLOAD_INCOMPLETE: true,
    STORAGE_UNAVAILABLE: true,
    QUOTA_EXCEEDED: true,
    FILE_INFECTED: true,
    SCAN_UNAVAILABLE: true,
  }

  test('lists every ProblemCode exactly once, all SCREAMING_SNAKE_CASE', () => {
    expect([...PROBLEM_CODES].sort()).toEqual(Object.keys(every).sort())
    expect(new Set(PROBLEM_CODES).size).toBe(PROBLEM_CODES.length)
    for (const code of PROBLEM_CODES) expect(code).toMatch(/^[A-Z][A-Z0-9_]*$/)
  })
})
