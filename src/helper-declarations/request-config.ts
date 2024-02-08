import {createCleanFile} from "../utils/string";

export const IRequestConfigString = "IRequestConfig";

// Credit to https://github.com/Manweill/swagger-axios-codegen
export const IRequestConfigDeclaration = createCleanFile([
  `interface ${IRequestConfigString} {`,
  "method?: any;",
  "headers?: any;",
  "url?: any;",
  "data?: any;",
  "params?: any;",
  "}",
]);
