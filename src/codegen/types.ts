import {BaseTypeMap} from "../type-mapping/map-base-type";
import {Operation, Swagger} from "../swagger/types";
import {GroupedArray} from "../utils/arrays";

export type SchemaTypeDeclaration = "class" | "interface" | "type";
export type MethodNameMode = "operationId" | "path";

export interface UserCodegenOptions {
  source: any;
  outputDirectory: string;

  createTagServices?: boolean;
  serviceNameSuffix?: string;
  apiClassName?: string;
  baseTypeMap?: BaseTypeMap;
  extraImports?: string;
  notRequiredFieldsOptional?: boolean;
  allowLiteralGenerics?: boolean;
  schemaTypeDeclaration?: SchemaTypeDeclaration;
  createReadMe?: boolean;
  methodNameMode?: MethodNameMode;
  createMethodsForAllTags?: boolean;
  generateHttpMethods?: boolean;
}

export interface CodegenOptions {
  /* Helper configs */
  swagger: Swagger;
  operations: Operation[];
  operationsGroupedByTag: GroupedArray<Operation, string | undefined>[];
  operationsGroupedByHttpMethod: GroupedArray<Operation, string>[];

  /* User defined options */
  createTagServices: boolean;
  serviceNameSuffix: string;
  apiClassName: string;
  baseTypeMap: Required<BaseTypeMap>;
  notRequiredFieldsOptional: boolean;
  allowLiteralGenerics: boolean;
  schemaTypeDeclaration: SchemaTypeDeclaration;
  createReadMe: boolean;
  methodNameMode: MethodNameMode;
  createMethodsForAllTags: boolean; // Puts the operation in all tag services in the tag array when true
  generateHttpMethods: boolean;
}
