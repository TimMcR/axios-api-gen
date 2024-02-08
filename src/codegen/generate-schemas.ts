import {cleanGenericString} from "../utils/clean-generic-string";
import {CodegenOptions} from "./types";
import {getSchemaDocumentation} from "../documentation/get-schema-documentation";
import {getType} from "../type-mapping/get-type";
import {createCleanFile} from "../utils/string";

export function generateSchemas(options: CodegenOptions): string {
  const {swagger, schemaTypeDeclaration} = options;

  const componentSchema = swagger.components.schemas;

  const schemas = Object.entries(componentSchema).reduce(
    (prev, [schemaName, schema]) => {
      const className = cleanGenericString(schemaName);

      const classType = getType(
        {
          sourceRequired: true,
          schema,
        },
        options,
      );

      const schemaDocumentation = getSchemaDocumentation(schema);

      const baseClass = createCleanFile([
        schemaDocumentation,
        `export ${schemaTypeDeclaration} ${className} ${
          schemaTypeDeclaration === "type" ? "=" : ""
        } ${classType}`,
        "",
      ]);

      return prev.concat(baseClass);
    },
    [] as string[],
  );

  return createCleanFile(schemas);
}
