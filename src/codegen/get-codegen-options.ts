import {getOperations} from "../get-operations";
import {DefaultBaseTypeAndConverterMap} from "../type-mapping/map-base-type";
import {Swagger} from "../swagger/types";
import {CodegenOptions, UserCodegenOptions} from "./types";

export function getCodegenOptions(options: UserCodegenOptions): CodegenOptions {
  const swagger = options.source as Swagger;

  const {
    baseTypeMap = DefaultBaseTypeAndConverterMap,
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

  return {
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
}

function cleanApiTitle(title: string): string {
  return title.replaceAll(".", "").replaceAll(" ", "");
}
