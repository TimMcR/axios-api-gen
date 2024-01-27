export function cleanRefName(schemaRef: string): string {
  return schemaRef
    .trim()
    .replaceAll("#/components/schemas/", "")
    .replaceAll(" ", "");
}
