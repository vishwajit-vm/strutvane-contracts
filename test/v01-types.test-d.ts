// Type-level tests for the contracts added in 0.1 (RFC-0002, RFC-0003, RFC-0004).
import { describe, expectTypeOf, test } from 'vitest'
import type {
  FileBody,
  Logger,
  LogLevel,
  LogRecord,
  Problem,
  StorageDisk,
  StoredFile,
  ValidationIssue,
} from '../src/index.ts'

describe('ValidationIssue / Problem.issues (RFC-0003)', () => {
  test('issues carry a path, a stable code, params and a rendered message', () => {
    const issue: ValidationIssue = {
      path: ['lines', 2, 'amount'],
      code: 'too_small',
      params: { min: 0 },
      message: 'Amount must be at least 0.',
    }
    const problem: Problem = {
      type: 'https://strutvane.dev/errors/validation',
      title: 'Validation failed',
      status: 422,
      code: 'VALIDATION_FAILED',
      issues: [issue, { path: [], code: 'date_order', message: 'End must be after start.' }],
    }
    expectTypeOf(problem.issues).toEqualTypeOf<readonly ValidationIssue[] | undefined>()
  })

  test('issue params are primitives only (no objects, which could carry secrets or break i18n)', () => {
    const bad: ValidationIssue = {
      path: ['x'],
      code: 'c',
      message: 'm',
      // @ts-expect-error params values must be string | number | boolean
      params: { user: { id: 1 } },
    }
    void bad
  })

  test('paths are readonly', () => {
    expectTypeOf<ValidationIssue['path']>().toEqualTypeOf<readonly (string | number)[]>()
  })
})

describe('Logger (RFC-0004)', () => {
  test('has one method per level, child loggers, level checks and an async flush', () => {
    expectTypeOf<Logger['info']>().toEqualTypeOf<
      (msg: string, fields?: Readonly<Record<string, unknown>>) => void
    >()
    expectTypeOf<ReturnType<Logger['child']>>().toEqualTypeOf<Logger>()
    expectTypeOf<Parameters<Logger['isLevelEnabled']>[0]>().toEqualTypeOf<LogLevel>()
    expectTypeOf<ReturnType<Logger['flush']>>().toEqualTypeOf<Promise<void>>()
  })

  test('log methods return void, so callers can never await or depend on logging', () => {
    expectTypeOf<ReturnType<Logger['error']>>().toBeVoid()
  })

  test('rejects unknown levels', () => {
    // @ts-expect-error "verbose" is not a LogLevel
    const bad: LogRecord = { time: '2026-11-14T00:00:00Z', level: 'verbose', msg: 'x' }
    void bad
  })
})

describe('StorageDisk (RFC-0002)', () => {
  test('put accepts streams, bytes and strings and returns StoredFile', () => {
    expectTypeOf<Parameters<StorageDisk['put']>[1]>().toEqualTypeOf<FileBody>()
    expectTypeOf<Awaited<ReturnType<StorageDisk['put']>>>().toEqualTypeOf<StoredFile>()
    expectTypeOf<Awaited<ReturnType<StorageDisk['get']>>>().toEqualTypeOf<
      ReadableStream<Uint8Array>
    >()
  })

  test('stat returns undefined for missing files instead of throwing', () => {
    expectTypeOf<Awaited<ReturnType<StorageDisk['stat']>>>().toEqualTypeOf<StoredFile | undefined>()
  })

  test('visibility is limited to private | public', () => {
    // @ts-expect-error "shared" is not a FileVisibility
    const bad: StoredFile['visibility'] = 'shared'
    void bad
  })
})
