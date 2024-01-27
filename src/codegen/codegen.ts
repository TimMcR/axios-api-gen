import {generateApiClass} from "../generate-api-class";
import {generateBaseClasses} from "../generate-base-class";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {format} from "prettier";
import {IRequestConfigDeclaration} from "../helper-declarations/request-config";
import {getFormDataFunctionDeclaration} from "../helper-declarations/get-form-data";
import {getConfigsDeclaration} from "../helper-declarations/get-configs";
import {defineTagServices} from "../define-tag-services";
import {createCleanFile} from "../utils/string";
import {UserCodegenOptions} from "./types";
import {getCodegenOptions} from "./get-codegen-options";

export function codegen(options: UserCodegenOptions) {
  const {extraImports, outputDirectory} = options;

  const codegenOptions = getCodegenOptions(options);

  const baseClasses = generateBaseClasses(codegenOptions);

  const apiClass = generateApiClass(codegenOptions);

  const tagServices = defineTagServices(codegenOptions);

  const file = createCleanFile([
    generatedString,
    axiosImports,
    extraImports,
    "",
    baseClasses,
    IRequestConfigDeclaration,
    getFormDataFunctionDeclaration,
    getConfigsDeclaration,
    apiClass,
    tagServices,
  ]);

  !existsSync(outputDirectory) && mkdirSync(outputDirectory);

  format(file, {
    parser: "typescript",
  }).then((formattedFile) =>
    writeFileSync(outputDirectory + "/index.defs.ts", formattedFile),
  );
}

const generatedString = `/** Generate by custom swagger codegen */`;
const axiosImports = `import { AxiosInstance, AxiosRequestConfig } from 'axios'`;
