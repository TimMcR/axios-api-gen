import {ContentType, Method, Schema} from "./swagger/types";

type getRequestBodySchemaReturnType = {
  schema?: Schema;
  contentType: ContentType;
};

export function getRequestBodySchema(
  methodObject: Method,
): getRequestBodySchemaReturnType {
  if (!methodObject.requestBody) {
    return {contentType: "application/json"};
  }

  const content = methodObject.requestBody.content;

  if (content["application/json"]) {
    return {
      schema: content["application/json"].schema,
      contentType: "application/json",
    };
  }

  if (content["multipart/form-data"]) {
    return {
      schema: content["multipart/form-data"].schema,
      contentType: "multipart/form-data",
    };
  }

  return {contentType: "application/json"};
}
