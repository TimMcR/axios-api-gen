import {Schema} from "../swagger/types";

export function getSchemaIsDictionary(schema: Schema): boolean {
  return Boolean(schema.additionalProperties);
}
