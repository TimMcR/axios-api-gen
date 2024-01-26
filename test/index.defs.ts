/** Generate by custom swagger codegen */
import { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * A user of the application
 */
export interface User {
  id?: number;
  username?: string;
}

/**
 * A test post schema
 */
export interface Post {
  id?: number;
  title?: string;
  content?: string;
}

interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

/* Helper Method for getting form data from request body */
/* eslint-disable */
function getFormData(data: any = {}): FormData {
  const formData = new FormData();

  if (!data) {
    return formData;
  }

  Object.entries(data).forEach(([key, value]) => {
    if (Object.prototype.toString.call(value) === "[object Array]") {
      for (const item of value as any) {
        formData.append(key, item as any);
      }
    } else {
      formData.append(key, value as any);
    }
  });

  return formData;
}

/* Helper method for getting axios configs*/
/* eslint-disable */
function getConfigs(
  method: string,
  contentType: string,
  url: string,
  options: any,
): IRequestConfig {
  const configs: IRequestConfig = {
    ...options,
    method,
    url,
  };
  configs.headers = {
    ...options.headers,
    "Content-Type": contentType,
  };
  return configs;
}

/**
 * A sample API for testing purposes
 * @version `1.0.0`
 */
export class SampleAPI {
  private static Axios: AxiosInstance;

  private static async callAxiosInstance(
    configs: IRequestConfig,
    resolve: (p: any) => void,
    reject: (p: any) => void,
  ): Promise<any> {
    if (!SampleAPI.Axios) {
      //TODO: throw custom error
      //throw new Error('SampleAPI needs injected axios instance');
      throw "SampleAPI needs injected axios instance";
    }

    return SampleAPI.Axios.request(configs)
      .then((res) => resolve(res.data))
      .catch((err) => reject(err));
  }

  static readonly setAxiosInstance = (instance: AxiosInstance) => {
    SampleAPI.Axios = instance;
  };

  /**
   * Operations related to users
   */
  static readonly Users = Object.freeze({
    /**
     * Get a list of users
     * @path `/users`
     */
    getUsers: async (
      params?: {},
      options: AxiosRequestConfig = {},
    ): Promise<Array<User>> =>
      new Promise<Array<User>>((resolve, reject) => {
        let url = "/users";

        const configs = getConfigs("get", "application/json", url, options);

        SampleAPI.callAxiosInstance(
          configs,
          (
            data: Array<{
              id?: number;
              username?: string;
            }>,
          ) => {
            let _data: Array<User> = data.map((x) => ({
              id: (x["id"] === undefined ? undefined : x["id"]) satisfies
                | number
                | undefined,
              username: (x["username"] === undefined
                ? undefined
                : x["username"]) satisfies string | undefined,
            }));

            resolve(_data);
          },
          reject,
        );
      }),
    /**
     * Create a new user
     * @path `/users`
     */
    postUsers: async (
      params: {
        body: User;
      },
      options: AxiosRequestConfig = {},
    ): Promise<User> =>
      new Promise<User>((resolve, reject) => {
        let url = "/users";

        const configs = getConfigs("post", "application/json", url, options);

        configs.data = {
          id: (params.body["id"] === undefined
            ? undefined
            : params.body["id"]) satisfies number | undefined,
          username: (params.body["username"] === undefined
            ? undefined
            : params.body["username"]) satisfies string | undefined,
        };

        SampleAPI.callAxiosInstance(
          configs,
          (data: { id?: number; username?: string }) => {
            let _data: User = {
              id: (data["id"] === undefined ? undefined : data["id"]) satisfies
                | number
                | undefined,
              username: (data["username"] === undefined
                ? undefined
                : data["username"]) satisfies string | undefined,
            };

            resolve(_data);
          },
          reject,
        );
      }),
  });
  /**
   * Operations related to posts
   */
  static readonly Posts = Object.freeze({
    /**
     * Get a list of posts
     * @path `/posts`
     */
    getPosts: async (
      params?: {},
      options: AxiosRequestConfig = {},
    ): Promise<Array<Post>> =>
      new Promise<Array<Post>>((resolve, reject) => {
        let url = "/posts";

        const configs = getConfigs("get", "application/json", url, options);

        SampleAPI.callAxiosInstance(
          configs,
          (
            data: Array<{
              id?: number;
              title?: string;
              content?: string;
            }>,
          ) => {
            let _data: Array<Post> = data.map((x) => ({
              id: (x["id"] === undefined ? undefined : x["id"]) satisfies
                | number
                | undefined,
              title: (x["title"] === undefined
                ? undefined
                : x["title"]) satisfies string | undefined,
              content: (x["content"] === undefined
                ? undefined
                : x["content"]) satisfies string | undefined,
            }));

            resolve(_data);
          },
          reject,
        );
      }),
    /**
     * Create a new post
     * @path `/posts`
     */
    postPosts: async (
      params: {
        body: Post;
      },
      options: AxiosRequestConfig = {},
    ): Promise<Post> =>
      new Promise<Post>((resolve, reject) => {
        let url = "/posts";

        const configs = getConfigs("post", "application/json", url, options);

        configs.data = {
          id: (params.body["id"] === undefined
            ? undefined
            : params.body["id"]) satisfies number | undefined,
          title: (params.body["title"] === undefined
            ? undefined
            : params.body["title"]) satisfies string | undefined,
          content: (params.body["content"] === undefined
            ? undefined
            : params.body["content"]) satisfies string | undefined,
        };

        SampleAPI.callAxiosInstance(
          configs,
          (data: { id?: number; title?: string; content?: string }) => {
            let _data: Post = {
              id: (data["id"] === undefined ? undefined : data["id"]) satisfies
                | number
                | undefined,
              title: (data["title"] === undefined
                ? undefined
                : data["title"]) satisfies string | undefined,
              content: (data["content"] === undefined
                ? undefined
                : data["content"]) satisfies string | undefined,
            };

            resolve(_data);
          },
          reject,
        );
      }),
  });
}
/**
 * Operations related to users
 */
export const UsersService = SampleAPI.Users;
/**
 * Operations related to posts
 */
export const PostsService = SampleAPI.Posts;
