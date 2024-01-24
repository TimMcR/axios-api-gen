import {createCleanFile} from '../../utils/string';

export const IRequestConfigString = 'IRequestConfig';

export const IRequestConfigDeclaration = createCleanFile([
  `interface ${IRequestConfigString} {`,
  'method?: any;',
  'headers?: any;',
  'url?: any;',
  'data?: any;',
  'params?: any;',
  '}',
]);
