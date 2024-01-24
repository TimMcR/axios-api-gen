import {cleanGenericRefName} from "./clean-generic-ref-name";
import {CodegenOptions} from "./codegen";
import {ApiResponseBaseTypeMap, BaseTypeMap} from "./map-base-type";
import {Schema} from "./utils";
import {createCleanFile} from "./utils/string";

type getTypeProps = {
  schema: Schema;
  sourceRequired: boolean | undefined;
  includeUndefinedType?: boolean;
  ignoreRef?: boolean;
};

type getTypeOptions = Omit<CodegenOptions, "baseTypeMap"> & {
  baseTypeMap: BaseTypeMap;
};

//Returns the type of the root schema.
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

  if (schema.type === "object" && !getSchemaIsDictionary(schema)) {
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
    if (getSchemaIsDictionary(schema)) {
      const valueType = getType(
        {...props, schema: schema.additionalProperties as Schema},
        options,
      );

      return baseTypeMap["dictionary"].default.type(valueType);
    }

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
      return baseType["default"].type;
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

type getTypeAssignmentProps = {
  schema: Schema;
  source: string;
  sourceRequired: boolean | undefined;
  sourceNullable: boolean | undefined;
  typeMapping: "response" | "request";
};

export function getTypeAssignment(
  props: getTypeAssignmentProps,
  options: CodegenOptions,
): string {
  const {swagger, baseTypeMap} = options;

  const {schema, source, typeMapping, sourceNullable, sourceRequired} = props;

  const typeSatisfies =
    " satisfies " +
    getType(
      {schema, sourceRequired},
      {
        ...options,
        baseTypeMap:
          typeMapping === "request" ? ApiResponseBaseTypeMap : baseTypeMap,
      },
    );

  const assignmentSafety = `${
    !sourceRequired ? `${source} === undefined ? undefined : ` : ""
  } ${sourceNullable ? `${source} === null ? null : ` : ""}`;

  const converterType =
    typeMapping === "request" ? "requestConverter" : "responseConverter";

  if (getSchemaIsDictionary(schema)) {
    const dictionaryProperties = baseTypeMap.dictionary.default[converterType](
      source,
      (_source) => {
        const dictionarySchema = schema.additionalProperties as Schema;

        return getTypeAssignment(
          {
            typeMapping: typeMapping,
            source: _source,
            schema: dictionarySchema,
            sourceNullable: dictionarySchema.nullable,
            sourceRequired: true,
          },
          options,
        );
      },
    );

    return assignmentSafety + dictionaryProperties;
  }

  if (schema.type === "object") {
    const objectProperties = schema.properties || {};
    const classProperties = Object.entries(objectProperties)
      .map(([propertyName, propertySchema]) => {
        const optional = (schema.required ?? []).indexOf(propertyName) === -1;

        const isNullable = !!propertySchema.nullable;

        const _source = `${source}['${propertyName}']`;

        return `${propertyName}:  ${getTypeAssignment(
          {
            typeMapping,
            schema: propertySchema,
            source: _source,
            sourceRequired: !optional,
            sourceNullable: isNullable,
          },
          options,
        )},`;
      })
      .join("\n");

    return (
      assignmentSafety +
      `({
  ${classProperties}
})`
    );
  }

  if (schema.$ref) {
    const cleanedRefName = schema.$ref.replace("#/components/schemas/", "");

    const refSchema = swagger.components.schemas[cleanedRefName];

    return getTypeAssignment({...props, schema: refSchema, source}, options);
  }

  if (schema.type === "array" && schema.items) {
    const schemaItems = schema.items;

    return (
      assignmentSafety +
      baseTypeMap["array"].default[converterType](source, (_source) => {
        return getTypeAssignment(
          {
            ...props,
            schema: schemaItems,
            source: _source,
            sourceNullable: schemaItems.items?.nullable,
            sourceRequired: true,
          },
          options,
        );
      })
    );
  }

  const baseTypeAssignment =
    baseTypeMap[schema.type]?.[schema.format ?? "default"]?.[converterType]?.(
      source,
    ) ?? `${source} /* unknown type map */`;

  return `(${assignmentSafety} ${baseTypeAssignment})` + typeSatisfies;
}

function getSchemaIsDictionary(schema: Schema): boolean {
  return !!schema.additionalProperties;
}
