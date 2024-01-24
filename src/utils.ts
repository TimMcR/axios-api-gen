export interface Swagger {
  openapi: string;
  info: Info;
  paths: Record<string, Record<string, Method>>;
  components: {
    schemas: Record<string, Schema>;
  };
  tags?: Tag[];
}

interface Tag {
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

export type ContentType = 'application/json' | 'multipart/form-data';

export interface Content {
  'application/json': {
    schema: Schema;
  };
  'multipart/form-data': {
    schema: Schema;
    encoding: {
      file: {
        style: 'form';
      };
    };
  };
}

export interface ApiResponse {
  description: string;
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
    in: 'path' | 'query' | 'header';
    required?: boolean;
    schema: Schema;
    description?: string;
  }>;
  requestBody?: Requestbody;
  responses: {
    '200': ApiResponse;
    '201': ApiResponse;
  };
  summary?: string;
}

export type SchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object';

export type SchemaFormat =
  | 'default'
  | 'date'
  | 'date-time'
  | 'password'
  | 'byte'
  | 'binary'
  | 'int32'
  | 'double';

export interface Schema {
  type: SchemaType;
  properties?: Record<string, Schema>;
  items?: Schema;
  $ref?: string;
  nullable?: boolean;
  format?: SchemaFormat;
  pattern?: string;
  required?: string[];
  additionalProperties?: true | Schema;
}

export function getSchemaRefType(schema: Schema): string {
  if (!schema.$ref) {
    return '';
  }

  const refType = `${schema.$ref.replace('#/components/schemas/', '')}`;

  // todo - replace this with base type mapping
  const cleanedRefType = refType.replaceAll('Int32', 'number');

  return cleanedRefType;
}

interface Generics {
  genericClassName: string;
  genericTypeName: string;
}

export function extractGenerics(input: string): Generics[] {
  const generics: string[] = [];

  let currentGeneric = '';
  let depth = 0;

  for (const char of input) {
    if (char === '<') {
      if (depth > 0) {
        currentGeneric += char;
      }
      depth++;
    } else if (char === '>') {
      depth--;
      if (depth > 0) {
        currentGeneric += char;
      } else {
        generics.push(currentGeneric);
        currentGeneric = '';
      }
    } else if (char === ',' && depth === 1) {
      generics.push(currentGeneric);
      currentGeneric = '';
    } else {
      currentGeneric += char;
    }
  }

  const baseType = input.split('<')[0].trim();

  const genericReferences = generics.map<Generics>((generic, index) => ({
    genericClassName: generic.replace(baseType, ''),
    genericTypeName: `T${index + 1}`,
  }));

  return genericReferences;
}

export function getGenericClassName(input: string) {
  const generics = extractGenerics(input);

  const baseType = input.split('<')[0].trim();

  const genericString = generics.map((x) => x.genericTypeName).join(', ');

  return `${baseType}<${genericString}>`;
}
