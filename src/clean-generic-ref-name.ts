export function cleanGenericRefName(schemaRef: string) {
  return schemaRef
    .trim()
    .replaceAll("#/components/schemas/", "")
    .replaceAll("<", "")
    .replaceAll(">", "")
    .replaceAll(",", "")
    .replaceAll(" ", "");
}
