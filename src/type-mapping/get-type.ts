import {cleanGenericRefName} from "../utils/clean-generic-ref-name";
import {CodegenOptions} from "../codegen/types";
import {BaseTypeMap} from "./map-base-type";
import {Schema} from "../swagger/types";
import {createCleanFile} from "../utils/string";
import {getSchemaIsDictionary} from "./get-schema-is-dictionary";

type getTypeProps = {
  schema: Schema;
  sourceRequired: boolean | undefined;
  includeUndefinedType?: boolean;
  ignoreRef?: boolean;
};

type getTypeOptions = Omit<CodegenOptions, "baseTypeMap"> & {
  baseTypeMap: BaseTypeMap;
};

/**
 * Returns the type of the schema
 */
export function getType(props: getTypeProps, options: getTypeOptions): string {
  const {
    swagger,
    baseTypeMap,
    allowLiteralGenerics,
    notRequiredFieldsOptional,
  } = options;

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
    const refName = schema.$ref.replace("#/components/schemas/", "");

    const refIsGeneric = refName.indexOf("<") > -1;

    if (ignoreRef || (!allowLiteralGenerics && refIsGeneric)) {
      const refSchema = swagger.components.schemas[refName];
      return getType({...props, schema: refSchema}, options);
    }

    return cleanGenericRefName(refName);
  }

  function getBasicType(schema: Schema): string {
    if (schema.type === "array" && schema.items) {
      const innerType = getType(
        {...props, sourceRequired: true, schema: schema.items},
        options,
      );

      return baseTypeMap["array"].default.type(innerType);
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
