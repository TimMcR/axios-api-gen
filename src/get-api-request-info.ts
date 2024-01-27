import {CodegenOptions} from "./codegen/types";
import {getRequestBodySchema} from "./get-request-body-schema";
import {getType, getTypeAssignment} from "./get-type";
import {getConfigsFunctionName} from "./helper-declarations/get-configs";
import {getFormDataFunctionName} from "./helper-declarations/get-form-data";
import {ApiResponseBaseTypeMap} from "./type-mapping/map-base-type";
import {Operation, Schema} from "./utils";
import {decapitalizeFirstChar} from "./utils/string";

type getApiRequestInfoProps = {
  operation: Operation;
  customParamsType?: string;
};

type getApiRequestInfoReturnType = {
  functionParamsType: string;
  functionReturn: string;
  functionReturnType: string;
  paramsOptional: boolean;
};

export function getApiRequestInfo(
  props: getApiRequestInfoProps,
  options: CodegenOptions,
): getApiRequestInfoReturnType {
  const {operation, customParamsType} = props;

  const {apiClassName} = options;

  const {method, pathName, httpMethod} = operation;

  const paramsSourceString = customParamsType ? `_params` : "params";

  //TODO - Get response schema better

  const responseSchema: Schema | undefined =
    method.responses["200"]?.content?.["application/json"]?.schema ??
    method.responses["201"]?.content?.["application/json"]?.schema ??
    undefined;

  const returnType = responseSchema
    ? getType(
        {
          schema: responseSchema,
          sourceRequired: true,
        },
        options,
      )
    : "void";

  const {schema: requestbodySchema, contentType} = getRequestBodySchema(method);

  const requestBodyRequired = method.requestBody?.required ?? false;

  const queryParamsDeclaration = (method.parameters ?? [])
    .filter((x) => x.in === "path" || x.in === "query")
    .reduce((prev, param) => {
      const type = getType(
        {
          schema: param.schema,
          sourceRequired: true, // We put the question mark in the property name already
        },
        options,
      );

      const cleaneParamdName = decapitalizeFirstChar(param.name).replaceAll(
        ".",
        "",
      );

      return prev.concat(
        `${cleaneParamdName}${param.required ? "" : "?"}: ${type},`,
      );
    }, "");

  const functionBodyType = requestbodySchema
    ? getType(
        {
          schema: requestbodySchema,
          sourceRequired: requestBodyRequired,
        },
        options,
      )
    : null;

  const bodyDeclaration = requestbodySchema
    ? `body${requestBodyRequired ? "" : "?"}: ${functionBodyType}`
    : "";

  const paramsOptional =
    queryParamsDeclaration.length === 0 &&
    //!requestBodyRequired ||
    bodyDeclaration.length === 0;

  const queryParams = (method.parameters ?? []).filter((x) => x.in === "query");

  const assignQueryParamsToConfig = queryParams.reduce(
    (prev, query, index, arr) => {
      let _base = prev;
      const length = arr.length;

      if (index === 0) {
        _base = `configs.params = ${
          paramsOptional ? `${paramsSourceString} && ` : ""
        }{\n`;
      }

      const cleanedQueryName = decapitalizeFirstChar(query.name).replaceAll(
        ".",
        "",
      );

      const source = `${paramsSourceString}['${cleanedQueryName}']`;

      const typeAssignment = getTypeAssignment(
        {
          schema: query.schema,
          source,
          typeMapping: "request",
          sourceNullable: false,
          sourceRequired: query.required,
        },
        options,
      );

      let assignment = _base.concat(`'${query.name}': ${typeAssignment},\n`);

      if (index === length - 1) {
        // assignment = assignment.concat(`} satisfies ${queryParamsType}\n`);
        assignment = assignment.concat(`}\n`);
      }

      return assignment;
    },
    "",
  );

  const paramBodySource = `${paramsSourceString}.body`;

  const baseAssignment = `configs.data = ${
    paramsOptional ? `${paramsSourceString} &&` : ""
  }`;

  let assignRequestBodyToConfig = "";

  if (requestbodySchema && contentType) {
    if (contentType === "application/json") {
      assignRequestBodyToConfig = `${baseAssignment} ${getTypeAssignment(
        {
          schema: requestbodySchema,
          source: paramBodySource,
          typeMapping: "request",
          sourceNullable: false,
          sourceRequired: requestBodyRequired,
        },
        options,
      )};`;
    } else if (contentType === "multipart/form-data") {
      assignRequestBodyToConfig = `${baseAssignment} ${getFormDataFunctionName}(${paramBodySource})`;
    }
  }

  const updateUrl = (method.parameters ?? [])
    .filter((x) => x.in === "path")
    .reduce((prev, param) => {
      return prev.concat(
        `url = url.replace('{${param.name}}', \`\${${paramsSourceString}['${param.name}']}\`)\n`,
      );
    }, "");

  let responseAssignments = "data";

  const responseType = responseSchema
    ? getType(
        {
          schema: responseSchema,
          ignoreRef: true,
          sourceRequired: true,
        },
        {...options, baseTypeMap: ApiResponseBaseTypeMap},
      )
    : "any";

  if (responseSchema) {
    responseAssignments = getTypeAssignment(
      {
        schema: responseSchema,
        source: `data`,
        typeMapping: "response",
        sourceNullable: false,
        sourceRequired: true,
      },
      options,
    );
  }

  const functionParamsType = `{
      ${queryParamsDeclaration}
          ${bodyDeclaration}
    }`;

  return {
    functionParamsType,
    paramsOptional,
    functionReturnType: returnType,
    functionReturn: `
    new Promise<${returnType}>((resolve, reject) => {
        ${
          customParamsType
            ? `const _params = params as ${customParamsType}`
            : ""
        }

          let url = '${pathName}';
          ${updateUrl}

          const configs = ${getConfigsFunctionName}('${httpMethod}', '${contentType}', url, options);

          ${assignQueryParamsToConfig}

          ${assignRequestBodyToConfig}

          ${apiClassName}.callAxiosInstance(configs, (data: ${responseType}) => {
            let _data: ${returnType} = ${responseAssignments}

            resolve(_data)
          }, reject)
        })`,
  };
}
