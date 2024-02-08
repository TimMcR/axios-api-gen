import {CodegenOptions} from "../codegen/types";
import {createCleanFile} from "../utils/string";

export function getApiClassDocumentation(options: CodegenOptions): string {
  const {version, description} = options.swagger.info;

  const apiDescription = description ? ` * ${description}` : undefined;

  return createCleanFile([
    "/**",
    apiDescription,
    ` * @version \`${version}\``,
    " */",
  ]);
}
