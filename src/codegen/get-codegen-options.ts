import {getOperations} from "./get-operations";
import {Swagger} from "../swagger/types";
import {CodegenOptions, UserCodegenOptions} from "./types";
import {getTypeConfig} from "../type-mapping/type-config";

export function getCodegenOptions(options: UserCodegenOptions): CodegenOptions {
  const swagger = options.source as Swagger;

  const {
    apiClassName = cleanApiTitle(swagger.info.title),
    createTagServices = true,
    notRequiredFieldsOptional = true,
    serviceNameSuffix = "Service",
    createReadMe = true,
    methodNameMode = "operationId",
    createMethodsForAllTags = true,
    generateHttpMethods = false,
  } = options;

  const typeConfig = getTypeConfig(options);

  const {operations, operationsGroupedByTag, operationsGroupedByHttpMethod} =
    getOperations({
      createMethodsForAllTags,
      swagger,
    });

  return {
    apiClassName,
    createTagServices,
    notRequiredFieldsOptional,
    serviceNameSuffix,
    swagger,
    createReadMe,
    methodNameMode,
    createMethodsForAllTags,
    operations,
    operationsGroupedByTag,
    operationsGroupedByHttpMethod,
    generateHttpMethods,
    ...typeConfig,
  };

  // TODO - validate swagger source
}

function cleanApiTitle(title: string): string {
  return title.replaceAll(".", "").replaceAll(" ", "");
}
