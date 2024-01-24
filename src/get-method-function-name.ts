import {capitalizeFirstChar, decapitalizeFirstChar} from '../utils/string';
import {CodegenOptions} from './codegen';
import {Method} from './utils';

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

  if (methodNameMode === 'path' || !method.operationId) {
    const cleanedPath = pathName
      .replaceAll('{', '/')
      .replaceAll('}', '/')
      .replaceAll('-', '/')
      .split('/')
      .reduce((prev, curr) => {
        return prev.concat(capitalizeFirstChar(curr));
      }, '');

    return httpMethod + cleanedPath;
  }

  return decapitalizeFirstChar(method.operationId);
}
