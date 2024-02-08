import {cleanGenericString} from "../utils/clean-generic-string";
import {CodegenOptions} from "../codegen/types";
import {Schema} from "../swagger/types";
import {createCleanFile} from "../utils/string";
import {getSchemaIsDictionary} from "./get-schema-is-dictionary";
import {cleanRefName} from "../utils/clean-ref-name";

type getTypeProps = {
  schema: Schema;
  sourceRequired: boolean | undefined;
  includeUndefinedType?: boolean;
  ignoreRef?: boolean;
};

/**
 * Returns the type of the schema
 */
export function getType(props: getTypeProps, options: CodegenOptions): string {
  const {swagger, baseTypeMap, notRequiredFieldsOptional} = options;

  const {
    schema,
    sourceRequired,
    includeUndefinedType = true,
    ignoreRef = false,
  } = props;

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

  function getBasicType(schema: Schema): string {
    if (schema.type === "array" && schema.items) {
      const innerType = getType(
        {...props, sourceRequired: true, schema: schema.items},
        options,
      );

      return baseTypeMap.array.default.type(innerType);
    }

    if (!schema.type) {
      return "any";
    }

    const baseType = baseTypeMap[schema.type];

    if (!baseType) {
      return "any";
    }

    if (!schema.format) {
      return baseType["default"]?.type;
    }

    const formatType = baseType[schema.format];

    if (!formatType) {
      return baseType["default"].type;
    }

    return formatType.type;
  }

  let _type = getBasicType(schema);

  if (schema.nullable && schema.nullable) {
    _type += " | null";
  }

  if (includeUndefinedType && !sourceRequired) {
    _type += " | undefined";
  }

  return _type;
}
