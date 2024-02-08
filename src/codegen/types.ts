import {Operation, Swagger} from "../swagger/types";
import {GroupedArray} from "../utils/arrays";
import {TypeConfig, UserTypeConfig} from "../type-mapping/type-config";

export type MethodNameMode = "operationId" | "path";

export interface UserCodegenOptions extends UserTypeConfig {
  source: any;
  outputDirectory: string;

  createTagServices?: boolean;
  serviceNameSuffix?: string;
  apiClassName?: string;
  extraImports?: string;
  notRequiredFieldsOptional?: boolean;
  createReadMe?: boolean;
  methodNameMode?: MethodNameMode;
  createMethodsForAllTags?: boolean;
  generateHttpMethods?: boolean;
}

export interface CodegenOptions extends TypeConfig {
  /* Helper configs */
  swagger: Swagger;
  operations: Operation[];
  operationsGroupedByTag: GroupedArray<Operation, string | undefined>[];
  operationsGroupedByHttpMethod: GroupedArray<Operation, string>[];

  /* User defined options */
  createTagServices: boolean;
  serviceNameSuffix: string;
  apiClassName: string;
  notRequiredFieldsOptional: boolean;
  createReadMe: boolean;
  methodNameMode: MethodNameMode;
  createMethodsForAllTags: boolean; // Puts the operation in all tag services in the tag array when true
  generateHttpMethods: boolean;
}
