import {
  DeepPartial,
  LooseAutoComplete,
  mergeWithDefaults,
} from "../utils/types";

type KnownStringFormats =
  | "date"
  | "date-time"
  | "password"
  | "byte"
  | "binary"
  | "uuid";

type KnownIntegerFormats = "int32";

type KnownNumberFormats = "double";

export type BasicTypeAndConverter = {
  type: string;
  responseConverter: (sourceReplaceString: string) => string;
  requestConverter: (sourceReplaceString: string) => string;
};

/**
 * Type maps that does not rely on a source type
 */
export type BasicTypeMapping<TFormats extends string = "default"> = Record<
  LooseAutoComplete<TFormats | "default">,
  BasicTypeAndConverter
>;

export type AdvancedTypeAndConverter = {
  type: (typeReplaceString: string) => string;
  responseConverter: (
    sourceReplaceString: string,
    typeResponseConverter: (typeReplaceString: string) => string,
  ) => string;
  requestConverter: (
    sourceReplaceString: string,
    typeResponseConverter: (typeReplaceString: string) => string,
  ) => string;
};

/**
 * Type maps that rely on a source type
 */
export type AdvancedTypeMapping = Record<
  LooseAutoComplete<"default">,
  AdvancedTypeAndConverter
>;

export interface BaseTypeMap {
  string: BasicTypeMapping<KnownStringFormats>;
  integer: BasicTypeMapping<KnownIntegerFormats>;
  number: BasicTypeMapping<KnownNumberFormats>;
  boolean: BasicTypeMapping;

  array: AdvancedTypeMapping;
  dictionary: AdvancedTypeMapping;
}

export const DefaultBaseTypeMap: Required<BaseTypeMap> = {
  string: {
    default: {
      type: "string",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
    date: {
      type: "Date",
      responseConverter: (s) => `new Date(${s})`, // new Date(s)
      requestConverter: (s) => `${s}.toISOString()`, // s.toISOString()
    },
    "date-time": {
      type: "Date",
      responseConverter: (s) => `new Date(${s})`, // new Date(s)
      requestConverter: (s) => `${s}.toISOString()`, // s.toISOString()
    },
    password: {
      type: "string",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
    byte: {
      type: "string",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
    binary: {
      type: "Blob",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
    uuid: {
      type: "string",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
  },
  integer: {
    default: {
      type: "number",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
    int32: {
      type: "number",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
  },
  number: {
    default: {
      type: "number",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
    double: {
      type: "number",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
  },
  boolean: {
    default: {
      type: "boolean",
      responseConverter: (s) => s,
      requestConverter: (s) => s,
    },
  },
  array: {
    default: {
      type: (t) => `Array<${t}>`,
      responseConverter: (s, t) => `${s}.map(x => ${t("x")})`,
      requestConverter: (s, t) => `${s}.map(x => ${t("x")})`,
    },
  },
  dictionary: {
    default: {
      type: (t) => `Record<string, ${t}>`,
      responseConverter: (s, t) =>
        `Object.entries(${s}).reduce((prev, [key, val]) => {
          prev[key] = ${t("val")};

          return prev;
        }, {})`,
      requestConverter: (s, t) =>
        `Object.entries(${s}).reduce((prev, [key, val]) => {
          prev[key] = ${t("val")};

          return prev;
        }, {})`,
    },
  },
};

export const DefaultUnknownType: BasicTypeAndConverter = {
  type: "any",
  requestConverter: (s) => s,
  responseConverter: (s) => s,
};

const _ApiResponseBaseTypeMap: DeepPartial<BaseTypeMap> = {
  string: {
    default: {
      type: "string",
    },
    date: {
      type: "string",
    },
    "date-time": {
      type: "string",
    },
    password: {
      type: "string",
    },
    byte: {
      type: "string",
    },
    binary: {
      type: "Blob",
    },
    uuid: {
      type: "string",
    },
  },
  integer: {
    default: {
      type: "number",
    },
    int32: {
      type: "number",
    },
  },
  number: {
    default: {
      type: "number",
    },
    double: {
      type: "number",
    },
  },
  boolean: {
    default: {
      type: "boolean",
    },
  },
  array: {
    default: {
      type: (t) => `Array<${t}>`,
    },
  },
  dictionary: {
    default: {
      type: (t) => `Record<string, ${t}>`,
    },
  },
};

export const ApiResponseBaseTypeMap = mergeWithDefaults<BaseTypeMap>(
  _ApiResponseBaseTypeMap,
  DefaultBaseTypeMap,
);
