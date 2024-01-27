import {CodegenOptions} from "../codegen/types";
import {createCleanFile} from "../utils/string";

type getTagDocumentationProps = {
  tagName: string;
};

export function getTagDocumentation(
  props: getTagDocumentationProps,
  options: CodegenOptions,
): string {
  const {tagName} = props;

  const tagSwagger = options.swagger.tags?.find((x) => x.name === tagName);

  const tagDescription =
    tagSwagger?.description === undefined
      ? undefined
      : ` * ${tagSwagger.description}`;

  const tagDocs =
    tagSwagger?.externalDocs === undefined
      ? undefined
      : ` * @docs ${tagSwagger.externalDocs}`;

  return createCleanFile(["/**", tagDescription, tagDocs, "*/"]);
}
