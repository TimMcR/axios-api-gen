import {CodegenOptions} from "../codegen/types";
import {Schema} from "../swagger/types";
import {cleanRefName} from "../utils/clean-ref-name";
import {getSchemaIsDictionary} from "./get-schema-is-dictionary";
import {getType} from "./get-type";
import {ApiResponseBaseTypeMap} from "./base-type-map";
import {getBasicTypeMap} from "./get-basic-type-map";

type getTypeAssignmentProps = {
  schema: Schema | undefined;
  source: string;
  sourceRequired: boolean | undefined;
  sourceNullable: boolean | undefined;
  typeMapping: "response" | "request";
};

/**
 * Returns the assignment string for the schema
 */
export function getTypeAssignment(
  props: getTypeAssignmentProps,
  options: CodegenOptions,
): string {
  const {swagger, baseTypeMap, unknownType} = options;

  const {schema, source, typeMapping, sourceNullable, sourceRequired} = props;

  const converterType =
    typeMapping === "request" ? "requestConverter" : "responseConverter";

  if (!schema) {
    return unknownType[converterType](source);
  }

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

        const propertyAssignment = getTypeAssignment(
          {
            typeMapping,
            schema: propertySchema,
            source: _source,
            sourceRequired: !optional,
            sourceNullable: isNullable,
          },
          options,
        );

        return `${propertyName}: ${propertyAssignment},`;
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
    const cleanedRefName = cleanRefName(schema.$ref);

    const refSchema = swagger.components.schemas[cleanedRefName];

    return getTypeAssignment({...props, schema: refSchema, source}, options);
  }

  if (schema.type === "array" && schema.items) {
    const schemaItems = schema.items;

    return (
      assignmentSafety +
      baseTypeMap.array.default[converterType](source, (_source) => {
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

  const typeMap = getBasicTypeMap(schema, options);

  const baseTypeAssignment = typeMap[converterType](source);

  return `(${assignmentSafety} ${baseTypeAssignment})` + typeSatisfies;
}
