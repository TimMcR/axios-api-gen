import {cleanGenericRefName} from "./clean-generic-ref-name";
import {CodegenOptions} from "./codegen";
import {getType} from "./get-type";
import {createCleanFile} from "./utils/string";

export function generateBaseClasses(options: CodegenOptions): string {
  const {swagger, allowLiteralGenerics, schemaTypeDeclaration} = options;

  const componentSchema = swagger.components.schemas;

  const schemas = Object.entries(componentSchema).reduce(
    (prev, [schemaName, schema]) => {
      //Skip generic classes
      if (!allowLiteralGenerics && schemaName.indexOf("<") > -1) {
        return prev;
      }

      const className = cleanGenericRefName(schemaName);

      const classType = getType(
        {
          sourceRequired: true,
          schema,
        },
        options,
      );

      return prev.concat(
        `export ${schemaTypeDeclaration} ${className} ${
          schemaTypeDeclaration === "type" ? "=" : ""
        } ${classType}`,
      );
    },
    [] as string[],
  );

  return createCleanFile(schemas);
}
