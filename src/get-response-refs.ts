interface SwaggerResponse {
  [key: string]: {
    responses?: {
      [key: string]: {
        content?: {
          [key: string]: {
            schema?: {
              $ref?: string;
            };
          };
        };
      };
    };
  };
}

export function getAllResponseRefTypesFromSwagger(
  swagger: Record<string, any>,
): string[] {
  const refTypes: string[] = [];

  function extractRefTypes(obj: Record<string, any>): void {
    for (const key in obj) {
      if (key === '$ref') {
        const refType = obj[key];
        if (refType) {
          refTypes.push(refType);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        extractRefTypes(obj[key]);
      }
    }
  }

  for (const path in swagger.paths) {
    const pathObject = swagger.paths[path];
    for (const method in pathObject) {
      const response = (pathObject[method] as SwaggerResponse)?.responses?.[
        '200'
      ];
      if (response && response.content) {
        for (const contentType in response.content) {
          const schema = response.content[contentType].schema;
          if (schema) {
            extractRefTypes(schema);
          }
        }
      }
    }
  }

  return refTypes.map((x) => x.replace('#/components/schemas/', ''));
}

export function getBaseResponseRefTypes(
  swagger: Record<string, any>,
): string[] {
  const allRefTypes = getAllResponseRefTypesFromSwagger(swagger);

  const baseRefTypes: string[] = [];

  allRefTypes.forEach((type) => {
    const cleanedType = type.replaceAll('>', '').replaceAll(',', '').trim();

    const baseTypes = cleanedType.split('<');

    baseRefTypes.push(...baseTypes);
  });

  return baseRefTypes.filter((x, i, arr) => arr.indexOf(x) === i);
}
