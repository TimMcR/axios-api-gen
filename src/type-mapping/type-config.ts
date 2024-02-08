import {
  BaseTypeMap,
  BasicTypeAndConverter,
  BasicTypeMapping,
  DefaultBaseTypeMap,
  DefaultUnknownType,
} from "./base-type-map";

export interface TypeConfig {
  baseTypeMap: BaseTypeMap;

  unknownType: BasicTypeAndConverter;

  extraTypes?: Record<string, BasicTypeMapping>;
}

export interface UserTypeConfig extends Partial<TypeConfig> {}

export function getTypeConfig(config: UserTypeConfig): TypeConfig {
  const {
    baseTypeMap = DefaultBaseTypeMap,
    unknownType = DefaultUnknownType,
    extraTypes,
  } = config;

  return {baseTypeMap, unknownType, extraTypes};
}
