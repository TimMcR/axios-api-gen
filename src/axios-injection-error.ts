export class AxiosInjectionError extends Error {
  constructor(apiName: string) {
    super(`Please inject axios instance into ${apiName}`);
  }
}
