import {createCleanFile} from '../utils/string';
import {CodegenOptions} from './codegen';
import {getApiRequestInfo} from './get-api-request-info';

type getHttpMethodsReturnType = {
  httpMethodsTypeDeclarations: string;
  httpMethods: string;
};

export function getHttpMethods(
  options: CodegenOptions,
): getHttpMethodsReturnType {
  const {operationsGroupedByHttpMethod, generateHttpMethods} = options;

  if (!generateHttpMethods) {
    return {httpMethodsTypeDeclarations: '', httpMethods: ''};
  }

  const httpMethodsTypeDeclarations = operationsGroupedByHttpMethod.map<string>(
    (group) => {
      const httpMethod = group.groupKey;

      const routes = group.map((x) => `'${x.pathName}'`).join(' | ');

      const routeType = `type ${getRouteTypeString(httpMethod)} = ${routes}\n`;

      const params =
        group
          .map((operation) => {
            const {pathName} = operation;

            const {functionParamsType} = getApiRequestInfo(
              {operation},
              options,
            );

            return `Type extends '${pathName}' ? ${functionParamsType}`;
          })
          .join(' : ') + ' : null';

      const paramType = `type ${getRouteParamTypeString(
        httpMethod,
      )}<Type extends ${getRouteTypeString(httpMethod)}> = ${params}`;

      const returns =
        group
          .map((operation) => {
            const {pathName} = operation;

            const {functionReturnType} = getApiRequestInfo(
              {operation},
              options,
            );

            return `Type extends '${pathName}' ? ${functionReturnType}`;
          })
          .join(' : ') + ' : null';

      const returnsType = `type ${getRouteReturnTypeString(
        httpMethod,
      )}<Type extends ${getRouteTypeString(httpMethod)}> = ${returns}`;

      return createCleanFile([routeType, paramType, returnsType]);
    },
  );

  const httpMethods = operationsGroupedByHttpMethod.map<string>((group) => {
    const httpMethod = group.groupKey;

    const paramType = getRouteParamTypeString(httpMethod);

    const returnType = getRouteReturnTypeString(httpMethod);

    const functionDefinitionStart = `static readonly ${httpMethod} = 
    async<T extends ${getRouteTypeString(
      httpMethod,
    )}>(route: T, params: ${paramType}<T>, options: AxiosRequestConfig = {}): Promise<${returnType}<T>> => {`;

    const functionDefinitions = group.map((operation, index, arr) => {
      const {pathName} = operation;

      const {functionReturn} = getApiRequestInfo(
        {operation, customParamsType: `${paramType}<'${pathName}'>`},
        options,
      );

      const returnDeclaration = `return (${functionReturn}) as Promise<${returnType}<T>>`;

      if (index === 0 && index === arr.length - 1) {
        return returnDeclaration;
      }

      return createCleanFile([
        `${index > 0 ? 'else' : ''} ${
          index === arr.length - 1 ? '' : `if (route === '${pathName}')`
        } {`,
        returnDeclaration,
        '}',
      ]);
    });

    return createCleanFile([
      functionDefinitionStart,
      ...functionDefinitions,
      '}',
    ]);
  });

  return {
    httpMethodsTypeDeclarations: createCleanFile(httpMethodsTypeDeclarations),
    httpMethods: createCleanFile(httpMethods),
  };
}

const getRouteTypeString = (httpMethod: string): string =>
  `${httpMethod.toUpperCase()}_ROUTE_TYPE`;

const getRouteParamTypeString = (httpMethod: string): string =>
  `${httpMethod.toUpperCase()}_ROUTE_PARAMS_TYPE`;

const getRouteReturnTypeString = (httpMethod: string): string =>
  `${httpMethod.toUpperCase()}_ROUTE_RETURN_TYPE`;
