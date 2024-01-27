export function cleanGenericRefName(schemaRef: string): string {
  return schemaRef
    .trim()
    .replaceAll("#/components/schemas/", "")
    .replaceAll("<", "")
    .replaceAll(">", "")
    .replaceAll(",", "")
    .replaceAll(" ", "");
}
