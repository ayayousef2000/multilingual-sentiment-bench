/**
 * Compile-time exhaustiveness check.
 * Use in the `default` branch of switch statements over discriminated unions.
 *
 * @example
 * switch (msg.type) {
 *   case "MODEL_READY": …; break;
 *   case "PROGRESS":    …; break;
 *   case "CLASSIFICATION_RESULT": …; break;
 *   case "ERROR":       …; break;
 *   default: assertNever(msg);
 * }
 */
export function assertNever(x: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(x)}`);
}

/**
 * Lightweight runtime invariant. Throws a descriptive error in development;
 * identical to a no-op assertion in production for tree-shaking friendliness.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}

/**
 * Type-safe non-null assertion with a descriptive message.
 */
export function defined<T>(value: T | null | undefined, label: string): T {
  invariant(value != null, `Expected ${label} to be defined`);
  return value;
}
