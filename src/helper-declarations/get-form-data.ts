export const getFormDataFunctionName = 'getFormData';

export const getFormDataFunctionDeclaration = `
/* Helper Method for getting form data from request body */
/* eslint-disable */
function ${getFormDataFunctionName}(data: any = {}): FormData {
  const formData = new FormData();

  if (!data) {
    return formData;
  }

  Object.entries(data).forEach(([key, value]) => {
    if (Object.prototype.toString.call(value) === '[object Array]') {
      for (const item of value as any) {
        formData.append(key, item as any);
      }
    } else {
      formData.append(key, value as any);
    }
  });

  return formData;
}`;
