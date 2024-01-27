import {cleanGenericString} from "../utils/clean-generic-string";
import {CodegenOptions} from "../codegen/types";
import {createCleanFile} from "../utils/string";

export function getReadmeSchemas(options: CodegenOptions): string {
  const {swagger, allowLiteralGenerics} = options;

  const componentSchema = swagger.components.schemas;

  const schemaNames = Object.keys(componentSchema).reduce(
    (prev, schemaName, index) => {
      if (index === 0) {
        prev.push("## Component Schemas");
      }

      //Skip generic classes
      if (!allowLiteralGenerics && schemaName.indexOf("<") > -1) {
        return prev;
      }

      const className = cleanGenericString(schemaName);

      return prev.concat(`#### ${className}`);
    },
    [] as string[],
  );

  return createCleanFile(schemaNames);
}
