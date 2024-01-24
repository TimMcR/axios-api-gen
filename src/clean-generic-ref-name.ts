export function cleanGenericRefName(schemaRef: string) {
  return schemaRef
    .replaceAll('#/components/schemas/', '')
    .replaceAll('<', '')
    .replaceAll('>', '')
    .replaceAll(',', '')
    .replaceAll(' ', '');
}
