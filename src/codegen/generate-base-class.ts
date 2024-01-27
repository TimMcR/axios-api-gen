import {cleanGenericString} from "../utils/clean-generic-string";
import {CodegenOptions} from "./types";
import {getSchemaDocumentation} from "../documentation/get-schema-documentation";
import {getType} from "../type-mapping/get-type";
import {createCleanFile} from "../utils/string";
import {cleanRefName} from "../utils/clean-ref-name";

export function generateBaseClasses(options: CodegenOptions): string {
  const {swagger, allowLiteralGenerics, schemaTypeDeclaration} = options;

  const componentSchema = swagger.components.schemas;

  const schemas = Object.entries(componentSchema).reduce(
    (prev, [schemaName, schema]) => {
      const refName = cleanRefName(schemaName);

      //Skip generic classes
      if (!allowLiteralGenerics && refName.indexOf("<") > -1) {
        return prev;
      }

      const className = cleanGenericString(refName);

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
