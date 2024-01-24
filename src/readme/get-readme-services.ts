import {createCleanFile} from '../../utils/string';
import {CodegenOptions} from '../codegen';

export function getReadmeServices(options: CodegenOptions): string {
  const {operationsGroupedByTag} = options;

  const services = operationsGroupedByTag.reduce((prev, curr, index) => {
    if (index === 0 && curr.groupKey) {
      prev.push('## Services');
    }

    const httpMethods = curr.map(({httpMethod, pathName}) => {
      return `##### ${httpMethod.toUpperCase()} - ${pathName}`;
    });

    const serviceGrouping = createCleanFile([
      curr.groupKey ? `#### ${curr.groupKey}` : '## Standalone Methods',
      ...httpMethods,
    ]);

    return prev.concat(serviceGrouping);
  }, [] as string[]);

  return createCleanFile(services);
}
