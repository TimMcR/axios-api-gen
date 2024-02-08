import {
  KnownBaseSchemaFormatMap,
  Schema,
  isKnownSchemaType,
} from "../swagger/types";
import {BasicTypeAndConverter} from "./base-type-map";
import {TypeConfig} from "./type-config";

export function getBasicTypeMap(
  schema: Schema,
  options: TypeConfig,
): BasicTypeAndConverter {
  const {baseTypeMap, unknownType} = options;

  if (!schema.type) {
    return unknownType;
  }

  if (schema.type === "object" || schema.type === "array") {
    throw new Error("Schema is not a basic type");
  }

  const knownSchemaType = KnownBaseSchemaFormatMap[schema.type];

  if (knownSchemaType) {
    const schemaType = baseTypeMap[schema.type];

    const knownSchemaFormat = knownSchemaType.find((x) => x === schema.format);

    if (knownSchemaFormat) {
      return schemaType[knownSchemaFormat] as BasicTypeAndConverter;
    }

    return schemaType.default as BasicTypeAndConverter;
  }

  const extraType = getExtraTypeMap(schema, options);

  return extraType ?? unknownType;
}

function getExtraTypeMap(
  schema: Schema,
  options: TypeConfig,
): BasicTypeAndConverter | undefined {
  const {extraTypes} = options;

  if (!extraTypes) {
    return undefined;
  }

  const extraType = Object.entries(extraTypes).find(
    ([type]) => type === schema.type,
  );

  if (!extraType) {
    return undefined;
  }

  const [, mapping] = extraType;

  const format = Object.keys(mapping).find(
    (format) => format === schema.format,
  );

  if (format) {
    return mapping[format];
  }

  return mapping.default;
}
