import {IRequestConfigString} from './request-config';

export const getConfigsFunctionName = 'getConfigs';

export const getConfigsDeclaration = `
/* Helper method for getting axios configs*/
/* eslint-disable */
function ${getConfigsFunctionName}(method: string, contentType: string, url: string, options: any): ${IRequestConfigString} {
  const configs: ${IRequestConfigString} = {
    ...options,
    method,
    url
  };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType
  };
  return configs;
}`;
