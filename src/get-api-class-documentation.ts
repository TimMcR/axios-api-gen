import {CodegenOptions} from "./codegen";
import {createCleanFile} from "./utils/string";

export function getApiClassDocumentation(options: CodegenOptions): string {
  const {version, description} = options.swagger.info;

  return createCleanFile([
    "/**",
    description,
    ` * @version \`${version}\``,
    " */",
  ]);
}
