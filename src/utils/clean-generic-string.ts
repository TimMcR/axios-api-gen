export function cleanGenericString(schemaRef: string): string {
  return schemaRef
    .trim()
    .replaceAll("<", "")
    .replaceAll(">", "")
    .replaceAll(",", "")
    .replaceAll(" ", "");
}
