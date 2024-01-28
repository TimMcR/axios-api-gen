import {BaseTypeMap} from "../type-mapping/base-type-map";
import {LooseAutoComplete} from "../utils/types";

export interface Swagger {
  openapi: string;
  info: Info;
  paths: Record<string, Record<string, Method>>;
  components: {
    schemas: Record<string, Schema>;
  };
  tags?: Tag[];
}

export interface Tag {
  name: string;
  description?: string;
  externalDocs?: string;
}

export interface Info {
  title: string;
  version: string;
  description?: string;
}

export interface Operation {
  httpMethod: string;
  pathName: string;
  method: Method;
  tag?: string;
}

export type ContentType = "application/json" | "multipart/form-data";

export interface Content {
  "application/json": {
    schema: Schema;
  };
  "multipart/form-data": {
    schema: Schema;
    encoding: {
      file: {
        style: "form";
      };
    };
  };
}

export interface ApiResponse {
  description?: string;
  content: Content;
}

export interface Requestbody {
  content: Content;
  description?: string;
  required: boolean;
}

export interface Method {
  tags?: string[];
  operationId?: string;
  parameters?: Array<{
    name: string;
    in: "path" | "query" | "header";
    required?: boolean;
    schema: Schema;
    description?: string;
  }>;
  requestBody?: Requestbody;
  responses: {
    "200": ApiResponse;
    "201": ApiResponse;
  };
  summary?: string;
}

export const KnownSchemaType = {
  string: "string",
  number: "number",
  integer: "integer",
  boolean: "boolean",
  array: "array",
  object: "object",
};
export type KnownSchemaType = keyof typeof KnownSchemaType;

export function isKnownSchemaType(
  type: LooseAutoComplete<KnownSchemaType>,
): type is keyof BaseTypeMap {
  return Object.keys(KnownSchemaType).some((key) => key === type);
}

export const KnownSchemaFormat = {
  default: "default",
  date: "date",
  "date-time": "date-time",
  password: "password",
  byte: "byte",
  binary: "binary",
  int32: "int32",
  double: "double",
};
export type KnownSchemaFormat = keyof typeof KnownSchemaFormat;

export function isKnownSchemaFormat(
  type: LooseAutoComplete<KnownSchemaFormat>,
): type is KnownSchemaFormat {
  return Object.keys(KnownSchemaFormat).some((key) => key === type);
}

export interface Schema {
  type?: LooseAutoComplete<KnownSchemaType>;
  format?: LooseAutoComplete<KnownSchemaFormat>;
  properties?: Record<string, Schema>;
  items?: Schema;
  $ref?: string;
  nullable?: boolean;
  pattern?: string;
  required?: string[];
  additionalProperties?: true | Schema;
  description?: boolean;
}
