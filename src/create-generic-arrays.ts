import {BaseTypeAndConverterMap} from './map-base-type';

// Allows users to create generic array types for
// array psuedos such as List or IEnumerable
export function createGenericArrays(
  names: string[],
  baseTypeMap: BaseTypeAndConverterMap,
) {
  const arrayTypeMap = baseTypeMap['array'].default.type;

  return names.reduce((prev, name) => {
    const genericName = 'T';

    const genericArrayName = `${name}<${genericName}>`;

    const genericArrayType = arrayTypeMap(genericName);

    return prev.concat(`type ${genericArrayName} = ${genericArrayType}\n`);
  }, '');
}
