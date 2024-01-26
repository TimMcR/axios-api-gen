import {CodegenOptions} from "./codegen";
import {getTagDocumentation} from "./documentation/get-tag-documentation";
import {createCleanFile} from "./utils/string";

export function defineTagServices(options: CodegenOptions): string {
  const {
    operationsGroupedByTag,
    serviceNameSuffix,
    apiClassName,
    createTagServices,
  } = options;

  if (!createTagServices) {
    return "";
  }

  const tagServices = operationsGroupedByTag.reduce(
    (prev, {groupKey: tagName}) => {
      if (!tagName) {
        return prev;
      }

      const serviceDocumentation = getTagDocumentation(
        {
          tagName,
        },
        options,
      );
      const service = `export const ${tagName}${serviceNameSuffix} = ${apiClassName}.${tagName}`;

      return prev.concat(serviceDocumentation, service);
    },
    [] as string[],
  );

  return createCleanFile(tagServices);
}
