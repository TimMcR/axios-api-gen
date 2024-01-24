import {CodegenOptions} from "./codegen";
import {Method} from "./utils";
import {createCleanFile, decapitalizeFirstChar} from "./utils/string";

type getMethodDocumentation = {
  method: Method;
  pathName: string;
};

export function getMethodDocumentation(
  props: getMethodDocumentation,
  options: CodegenOptions,
): string {
  const {method, pathName} = props;

  const paramSummaries = getParameterSummaries(method);

  const methodSummary =
    method.summary === undefined ? undefined : ` * ${method.summary}`;

  return createCleanFile([
    "/**",
    methodSummary,
    ` * @path \`${pathName}\``,
    ...paramSummaries,
    "*/",
  ]);
}

function getParameterSummaries(methodObject: Method): string[] {
  return (
    methodObject.parameters?.reduce((prev, param) => {
      if (param.in === "header" || !param.description) {
        return prev;
      }

      const paramName = decapitalizeFirstChar(param.name).replaceAll(".", "");

      return prev.concat(
        ` * @param params.${paramName} ${param.description ?? ""}\n`,
      );
    }, [] as string[]) ?? []
  );
}
