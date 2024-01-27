import {Operation, Swagger} from "../swagger/types";
import {GroupedArray, groupBy} from "../utils/arrays";

type getOperationsProps = {
  swagger: Swagger;
  createMethodsForAllTags: boolean;
};

type getOperationsReturnType = {
  operations: Operation[];
  operationsGroupedByTag: GroupedArray<Operation, string | undefined>[];
  operationsGroupedByHttpMethod: GroupedArray<Operation, string>[];
};

export function getOperations(
  props: getOperationsProps,
): getOperationsReturnType {
  const {swagger, createMethodsForAllTags} = props;

  const operations = Object.entries(swagger.paths).reduce(
    (prev, [pathName, pathObject]) => {
      const pathOperations = Object.entries(pathObject).reduce(
        (_prev, [httpMethod, method]) => {
          if (!method.tags || method.tags.length === 0) {
            return _prev.concat({
              httpMethod,
              method,
              pathName,
              tag: undefined,
            });
          }

          const methodsByTag = method.tags.reduce((__prev, tag, index) => {
            if (!createMethodsForAllTags && index > 0) {
              return __prev;
            }

            return __prev.concat({
              httpMethod,
              method,
              pathName,
              tag,
            });
          }, [] as Operation[]);

          return _prev.concat(methodsByTag);
        },
        [] as Operation[],
      );

      return prev.concat(pathOperations);
    },
    [] as Operation[],
  );

  const operationsGroupedByTag = groupBy(operations, (o) => o.tag).sort(
    tagNameSort,
  );

  const operationsGroupedByHttpMethod = groupBy(
    operations,
    (o) => o.httpMethod,
  );

  return {operations, operationsGroupedByTag, operationsGroupedByHttpMethod};
}

const tagNameSort = (
  a: GroupedArray<Operation, string | undefined>,
  b: GroupedArray<Operation, string | undefined>,
) => {
  const isFalsyA = !a.groupKey;
  const isFalsyB = !b.groupKey;

  if (isFalsyA && !isFalsyB) {
    return 1; // Move a to the end
  } else if (!isFalsyA && isFalsyB) {
    return -1; // Move b to the end
  }

  return 0; // Maintain the order
};
