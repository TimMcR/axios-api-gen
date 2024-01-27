import {writeFileSync} from "fs";
import {createCleanFile} from "../utils/string";
import {getReadmeSchemas} from "./get-readme-schemas";
import {getReadmeServices} from "./get-readme-services";
import {CodegenOptions} from "../codegen/types";
import {UserCreateReadmeOptions} from "./types";

export function createReadMe(
  options: UserCreateReadmeOptions,
  codegenOptions: CodegenOptions,
) {
  const {outputDirectory} = options;

  const {apiClassName, swagger} = codegenOptions;

  const schemas = getReadmeSchemas(codegenOptions);
  const services = getReadmeServices(codegenOptions);

  const readMe = createCleanFile([
    `# ${apiClassName}`,
    `## Version ${swagger.info.version}`,
    swagger.info.description,
    services,
    schemas,
  ]);

  writeFileSync(outputDirectory + "/readme.md", readMe);
}
