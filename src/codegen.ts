import {generateApiClass} from "./generate-api-class";
import {generateBaseClasses} from "./generate-base-class";
import {
  BaseTypeAndConverterMap,
  DefaultBaseTypeAndConverterMap,
} from "./map-base-type";
import {Operation, Swagger} from "./utils";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {format} from "prettier";
import {getReadmeSchemas} from "./readme/get-readme-schemas";
import {getReadmeServices} from "./readme/get-readme-services";
import {IRequestConfigDeclaration} from "./helper-declarations/request-config";
import {getFormDataFunctionDeclaration} from "./helper-declarations/get-form-data";
import {getConfigsDeclaration} from "./helper-declarations/get-configs";
import {getOperations} from "./get-operations";
import {defineTagServices} from "./define-tag-services";
import {GroupedArray} from "./utils/arrays";
import {createCleanFile} from "./utils/string";

type SchemaTypeDeclaration = "class" | "interface" | "type";
type MethodNameMode = "operationId" | "path";

type UserCodegenOptions = {
  source: any;
  outputDirectory: string;
  createTagServices?: boolean;
  serviceNameSuffix?: string;
  apiClassName?: string;
  baseTypeMap?: BaseTypeAndConverterMap;
  extraImports?: string;
  notRequiredFieldsOptional?: boolean;
  allowLiteralGenerics?: boolean;
  schemaTypeDeclaration?: SchemaTypeDeclaration;
  createReadMe?: boolean;
  methodNameMode?: MethodNameMode;
  createMethodsForAllTags?: boolean;
  generateHttpMethods?: boolean;
};

export type CodegenOptions = {
  /* Helper configs */
  swagger: Swagger;
  operations: Operation[];
  operationsGroupedByTag: GroupedArray<Operation, string | undefined>[];
  operationsGroupedByHttpMethod: GroupedArray<Operation, string>[];

  /* User defined options */
  createTagServices: boolean;
  serviceNameSuffix: string;
  apiClassName: string;
  baseTypeMap: BaseTypeAndConverterMap;
  notRequiredFieldsOptional: boolean;
  allowLiteralGenerics: boolean;
  schemaTypeDeclaration: SchemaTypeDeclaration;
  createReadMe: boolean;
  methodNameMode: MethodNameMode;
  createMethodsForAllTags: boolean; // Puts the operation in all tag services in the tag array when true
  generateHttpMethods: boolean;
};

export function codegen(options: UserCodegenOptions) {
  const swagger = options.source as Swagger;

  const {
    outputDirectory,
    baseTypeMap = DefaultBaseTypeAndConverterMap,
    extraImports = "",
    allowLiteralGenerics = false,
    apiClassName = cleanApiTitle(swagger.info.title),
    createTagServices = true,
    notRequiredFieldsOptional = true,
    serviceNameSuffix = "Service",
    schemaTypeDeclaration = "interface",
    createReadMe = true,
    methodNameMode = "operationId",
    createMethodsForAllTags = true,
    generateHttpMethods = false,
  } = options;

  const {operations, operationsGroupedByTag, operationsGroupedByHttpMethod} =
    getOperations({
      createMethodsForAllTags,
      swagger,
    });

  const codegenOptions: CodegenOptions = {
    allowLiteralGenerics,
    apiClassName,
    baseTypeMap,
    createTagServices,
    notRequiredFieldsOptional,
    serviceNameSuffix,
    swagger,
    schemaTypeDeclaration,
    createReadMe,
    methodNameMode,
    createMethodsForAllTags,
    operations,
    operationsGroupedByTag,
    operationsGroupedByHttpMethod,
    generateHttpMethods,
  };

  // TODO - validate swagger source
  const baseClasses = generateBaseClasses(codegenOptions);

  const apiClass = generateApiClass(codegenOptions);

  const tagServices = defineTagServices(codegenOptions);

  const file = createCleanFile([
    generatedString,
    axiosImports,
    extraImports,
    "",
    baseClasses,
    IRequestConfigDeclaration,
    getFormDataFunctionDeclaration,
    getConfigsDeclaration,
    apiClass,
    tagServices,
  ]);

  !existsSync(outputDirectory) && mkdirSync(outputDirectory);

  format(file, {
    parser: "typescript",
  }).then((formattedFile) =>
    writeFileSync(outputDirectory + "/index.defs.ts", formattedFile),
  );

  if (!createReadMe) {
    return;
  }

  const schemas = getReadmeSchemas(codegenOptions);
  const services = getReadmeServices(codegenOptions);

  const readMe = createCleanFile([
    `# ${apiClassName}`,
    `## Version ${swagger.info.version}`,
    swagger.info.description,
    services,
    schemas,
  ]);

  writeFileSync(outputDirectory + "/readme.md", readMe);
}

function cleanApiTitle(title: string): string {
  return title.replaceAll(".", "").replaceAll(" ", "");
}

const generatedString = `/** Generate by custom swagger codegen */`;
const axiosImports = `import { AxiosInstance, AxiosRequestConfig } from 'axios'`;
