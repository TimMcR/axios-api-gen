import {cleanGenericString} from "../utils/clean-generic-string";
import {CodegenOptions} from "../codegen/types";
import {Schema} from "../swagger/types";
import {createCleanFile} from "../utils/string";
import {getSchemaIsDictionary} from "./get-schema-is-dictionary";
import {cleanRefName} from "../utils/clean-ref-name";
import {getBasicTypeMap} from "./get-basic-type-map";

type getTypeProps = {
  schema: Schema | undefined;
  sourceRequired: boolean | undefined;
  includeUndefinedType?: boolean;
  ignoreRef?: boolean;
};

/**
 * Returns the type of the schema
 */
export function getType(props: getTypeProps, options: CodegenOptions): string {
  const prefix = getTypePrefix(props, options);

  const postfix = getTypePostfix(props);

  return prefix + postfix;
}

function getTypePrefix(props: getTypeProps, options: CodegenOptions) {
  const {swagger, baseTypeMap, notRequiredFieldsOptional, unknownType} =
    options;

  const {schema, ignoreRef = false} = props;

  if (!schema) {
    return unknownType.type;
  }

  if (getSchemaIsDictionary(schema)) {
    const valueType = getType(
      {...props, schema: schema.additionalProperties as Schema},
      options,
    );

    return baseTypeMap["dictionary"].default.type(valueType);
  }

  if (schema.type === "object") {
    const objectProperties = schema.properties || {};

    const classProperties = Object.entries(objectProperties).map(
      ([propertyName, propertySchema]) => {
        const optional =
          notRequiredFieldsOptional &&
          (schema.required ?? []).indexOf(propertyName) === -1;

        const propertyType = getType(
          {
            ...props,
            schema: propertySchema,
          },
          options,
        );

        return `'${propertyName}'${optional ? "?" : ""}: ${propertyType};`;
      },
    );

    return createCleanFile(["{", ...classProperties, "}"]);
  }

  if (schema.$ref) {
    const refName = cleanRefName(schema.$ref);

    if (ignoreRef) {
      const refSchema = swagger.components.schemas[refName];
      return getType({...props, schema: refSchema}, options);
    }

    return cleanGenericString(refName);
  }

  if (schema.type === "array" && schema.items) {
    const innerType = getType(
      {...props, sourceRequired: true, schema: schema.items},
      options,
    );

    return baseTypeMap.array.default.type(innerType);
  }

  return getBasicTypeMap(schema, options).type;
}

function getTypePostfix(props: getTypeProps): string {
  const {schema, includeUndefinedType = true, sourceRequired} = props;

  if (!schema) {
    return "";
  }

  let prefix = "";

  if (includeUndefinedType && !sourceRequired) {
    prefix += " | undefined";
  }

  if (schema.nullable && schema.nullable) {
    prefix += " | null";
  }

  return prefix;
}
