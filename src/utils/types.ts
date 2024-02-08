export type LooseAutoComplete<T extends string> =
  | T
  | (string & NonNullable<unknown>);

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T | undefined;

export function mergeWithDefaults<T>(
  partial: DeepPartial<T>,
  defaults: Required<T>,
): Required<T> {
  if (typeof defaults !== "object") {
    if (partial === undefined) {
      return defaults;
    }
    return partial as Required<T>;
  }

  return Object.entries(defaults).reduce((prev, [key, val]) => {
    prev[key] = mergeWithDefaults(partial[key], val);

    return prev;
  }, defaults);
}
