import {CodegenOptions} from "./codegen/types";
import {Method} from "./utils";
import {capitalizeFirstChar, decapitalizeFirstChar} from "./utils/string";

type getMethodFunctionNameProps = {
  method: Method;
  pathName: string;
  httpMethod: string;
};

export function getMethodFunctionName(
  props: getMethodFunctionNameProps,
  options: CodegenOptions,
): string {
  const {pathName, method, httpMethod} = props;
  const {methodNameMode} = options;

  if (methodNameMode === "path" || !method.operationId) {
    const cleanedPath = pathName
      .replaceAll("{", "/")
      .replaceAll("}", "/")
      .replaceAll("-", "/")
      .split("/")
      .reduce((prev, curr) => {
        return prev.concat(capitalizeFirstChar(curr));
      }, "");

    return httpMethod + cleanedPath;
  }

  return decapitalizeFirstChar(method.operationId);
}
