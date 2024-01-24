import {createCleanFile} from '../utils/string';
import {CodegenOptions} from './codegen';

export function getApiClassDocumentation(options: CodegenOptions): string {
  const {version, description} = options.swagger.info;

  return createCleanFile([
    '/**',
    description,
    ` * @version \`${version}\``,
    ' */',
  ]);
}
