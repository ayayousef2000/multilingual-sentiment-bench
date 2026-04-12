export function assertNever(x: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(x)}`);
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invariant violation: ${message}`);
}

export function defined<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Expected defined value for "${label}", got ${value}`);
  }
  return value;
}
