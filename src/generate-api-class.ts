import {CodegenOptions} from "./codegen";
import {getApiRequestInfo} from "./get-api-request-info";
import {getMethodFunctionName} from "./get-method-function-name";
import {getMethodDocumentation} from "./get-method-documentation";
import {getTagDocumentation} from "./get-tag-documentation";
import {getApiClassDocumentation} from "./get-api-class-documentation";
import {IRequestConfigString} from "./helper-declarations/request-config";
import {getHttpMethods} from "./get-http-methods";
import {groupBy} from "./utils/arrays";
import {createCleanFile} from "./utils/string";

export function generateApiClass(options: CodegenOptions): string {
  const {apiClassName} = options;

  const services = getMethodsGroupedByTag(options);

  const {methods: standaloneMethods} = getStandaloneMethods(options);

  const {httpMethods, httpMethodsTypeDeclarations} = getHttpMethods(options);

  const apiClassDocs = getApiClassDocumentation(options);

  return `
  ${httpMethodsTypeDeclarations}

    ${apiClassDocs}
  export class ${apiClassName} {
    private static Axios: AxiosInstance;

    private static async callAxiosInstance(
    configs: ${IRequestConfigString},
    resolve: (p: any) => void,
    reject: (p: any) => void,
  ): Promise<any> {
    if (!${apiClassName}.Axios) {
        //TODO: throw custom error
      //throw new Error('${apiClassName} needs injected axios instance');
      throw '${apiClassName} needs injected axios instance'
    }

    return ${apiClassName}.Axios.request(configs)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  }

    static readonly setAxiosInstance = (instance: AxiosInstance) => {
      ${apiClassName}.Axios = instance;
    }

    ${services}

    ${standaloneMethods}

    ${httpMethods}
  }`;
}

function getMethodsGroupedByTag(options: CodegenOptions): string {
  const {operations} = options;

  const groupedOperations = groupBy(operations, (o) => o.tag);

  const serviceDefinitions = groupedOperations.reduce((prev, curr) => {
    const serviceName = curr.groupKey;

    if (!serviceName) {
      return prev;
    }

    const serviceDocs = getTagDocumentation({tagName: serviceName}, options);

    const serviceFunctions = curr.map((operation) => {
      const {httpMethod, method, pathName} = operation;

      const {
        functionParamsType,
        paramsOptional,
        functionReturn,
        functionReturnType,
      } = getApiRequestInfo({operation}, options);

      const operationName = getMethodFunctionName(
        {
          httpMethod,
          method,
          pathName,
        },
        options,
      );

      const documentation = getMethodDocumentation(
        {
          method,
          pathName,
        },
        options,
      );

      const functionParams = `params${
        paramsOptional ? "?" : ""
      }:${functionParamsType}`;

      const functionDefinition = `${operationName}: async (${functionParams}, options: AxiosRequestConfig = {}): Promise<${functionReturnType}> => ${functionReturn},`;

      return createCleanFile([documentation, functionDefinition]);
    });

    const serviceDefinition = createCleanFile([
      serviceDocs,
      `static readonly ${serviceName} = Object.freeze({`,
      ...serviceFunctions,
      `});`,
    ]);

    return prev.concat(serviceDefinition);
  }, [] as string[]);

  return createCleanFile(serviceDefinitions);
}

type getStandaloneMethodsReturnType = {
  methods: string;
  methodCount: number;
};

function getStandaloneMethods(
  options: CodegenOptions,
): getStandaloneMethodsReturnType {
  const {operations} = options;

  let methodCount = 0;

  const methods = operations.reduce((prev, curr) => {
    if (curr.tag) {
      return prev;
    }

    const {httpMethod, method, pathName} = curr;

    const {
      functionParamsType,
      paramsOptional,
      functionReturn,
      functionReturnType: returnType,
    } = getApiRequestInfo(
      {
        operation: curr,
      },
      options,
    );

    const operationName = getMethodFunctionName(
      {
        httpMethod,
        method,
        pathName,
      },
      options,
    );

    const documentation = getMethodDocumentation(
      {
        method,
        pathName,
      },
      options,
    );

    methodCount++;

    const functionParams = `params${
      paramsOptional ? "?" : ""
    }:${functionParamsType}`;

    const operation = createCleanFile([
      documentation,
      `static readonly ${operationName} = 
      async (${functionParams}, options: AxiosRequestConfig = {}): Promise<${returnType}> => ${functionReturn}\n`,
    ]);

    return prev.concat(operation);
  }, "");

  return {methods, methodCount};
}
