export type LooseAutoComplete<T extends string> =
  | T
  | (string & NonNullable<unknown>);

const g: Record<Exclude<string, "@" | "">, number> = {
  "@": 12,
};
