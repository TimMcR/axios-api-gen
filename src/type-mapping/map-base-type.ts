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

/**
 * Type maps that does not rely on a source type
 */
type BasicTypeMap<TFormats extends string = "default"> = Record<
  LooseAutoComplete<TFormats | "default">,
  {
    type: string;
    responseConverter: (sourceReplaceString: string) => string;
    requestConverter: (sourceReplaceString: string) => string;
  }
>;

/**
 * Type maps that rely on a source type
 */
type AdvancedTypeMap = Record<
  LooseAutoComplete<"default">,
  {
    type: (typeReplaceString: string) => string;
    responseConverter: (
      sourceReplaceString: string,
      typeResponseConverter: (typeReplaceString: string) => string,
    ) => string;
    requestConverter: (
      sourceReplaceString: string,
      typeResponseConverter: (typeReplaceString: string) => string,
    ) => string;
  }
>;

export interface BaseTypeMap {
  string: BasicTypeMap<KnownStringFormats>;
  integer: BasicTypeMap<KnownIntegerFormats>;
  number: BasicTypeMap<KnownNumberFormats>;
  boolean: BasicTypeMap;
  array: AdvancedTypeMap;
  dictionary: AdvancedTypeMap;
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
  // unknown: {
  //   default: {
  //     type: "any",
  //     responseConverter: (s) => s,
  //     requestConverter: (s) => s,
  //   },
  // },
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
