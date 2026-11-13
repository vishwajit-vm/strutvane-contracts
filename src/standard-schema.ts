/**
 * Standard Schema v1 interface (https://standardschema.dev), copied as the spec intends so that
 * `@strutvane/contracts` keeps zero runtime dependencies. Any compliant validator (Zod, Valibot,
 * ArkType, …) satisfies {@link StandardSchemaV1} structurally, without importing this package.
 *
 * The upstream spec uses a TypeScript namespace; it is flattened here into plain interfaces to
 * keep the codebase free of non-erasable syntax. The shape is identical.
 *
 * @module
 */

/** A validator that follows the Standard Schema v1 spec. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. The `~` prefix keeps them out of editor autocompletion. */
  readonly '~standard': StandardSchemaV1Props<Input, Output>
}

/** The properties every Standard Schema validator exposes under `~standard`. */
export interface StandardSchemaV1Props<Input = unknown, Output = Input> {
  /** Version of the Standard Schema spec. Always `1`. */
  readonly version: 1
  /** Name of the library that implements the validator, e.g. `"zod"`. */
  readonly vendor: string
  /** Validate an unknown value. May be synchronous or asynchronous. */
  readonly validate: (
    value: unknown,
  ) => StandardSchemaV1Result<Output> | Promise<StandardSchemaV1Result<Output>>
  /** Inferred input/output types (type-level only; never present at runtime). */
  readonly types?: StandardSchemaV1Types<Input, Output> | undefined
}

/** The result of a validation: either a value or a list of issues. */
export type StandardSchemaV1Result<Output> =
  | StandardSchemaV1SuccessResult<Output>
  | StandardSchemaV1FailureResult

/** A successful validation. */
export interface StandardSchemaV1SuccessResult<Output> {
  /** The validated (and possibly transformed) value. */
  readonly value: Output
  /** Always `undefined` on success. */
  readonly issues?: undefined
}

/** A failed validation. */
export interface StandardSchemaV1FailureResult {
  /** At least one issue describing why validation failed. */
  readonly issues: ReadonlyArray<StandardSchemaV1Issue>
}

/** One validation problem. */
export interface StandardSchemaV1Issue {
  /** Human-readable message. */
  readonly message: string
  /** Where in the input the problem is, e.g. `["lines", 2, "amount"]`. */
  readonly path?: ReadonlyArray<PropertyKey | StandardSchemaV1PathSegment> | undefined
}

/** A path segment object (some libraries use objects instead of raw keys). */
export interface StandardSchemaV1PathSegment {
  /** The key of this segment. */
  readonly key: PropertyKey
}

/** Type-level carrier for a validator's input and output types. */
export interface StandardSchemaV1Types<Input = unknown, Output = Input> {
  /** The type the validator accepts. */
  readonly input: Input
  /** The type the validator produces. */
  readonly output: Output
}

/** Infer the input type of a Standard Schema validator. */
export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['input']

/** Infer the output type of a Standard Schema validator. */
export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
  Schema['~standard']['types']
>['output']
