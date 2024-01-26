import {Schema} from "../utils";
import {createCleanFile} from "../utils/string";

export function getSchemaDocumentation(schema: Schema) {
  const description = schema.description
    ? ` * ${schema.description}`
    : undefined;

  return createCleanFile(["/**", description, " */"]);
}
