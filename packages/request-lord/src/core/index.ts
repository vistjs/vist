import ConfigCenter, { Config } from './ConfigCenter';
import { convertHeadersToObject } from './utils/fetchUtils';

/**
 * 请求拦截器
 * 根据请求的不同阶段，注入不同的钩子：
 * 请求发起：可修改请求参数
 * 请求执行：可替换实际的请求方法
 * 请求返回：可修改返回数据
 */

export default class Inteceptor {
  private configCenter = new ConfigCenter();
  private global: Window | typeof globalThis;

  private fetch: (input: URL | RequestInfo, init?: AnyObject) => Promise<Response>;

  constructor({
    requestConfigs,
    commonConfig,
  }: {
    requestConfigs?: Config[];
    commonConfig?: Config;
  } = {}) {
    if (requestConfigs) {
      requestConfigs.forEach((c) => this.configCenter.saveRequestConfig(c));
    }
    if (commonConfig) {
      this.configCenter.saveCommonConfig(commonConfig);
    }

    this.global = this.getGlobal();
    this.intecept();
  }

  getGlobal() {
    if (typeof window !== 'undefined') {
      return window;
    } else if (typeof global !== 'undefined') {
      return global;
    }
    throw new Error('Detect global variable error');
  }

  getFullRequestUrl(url: string) {
    if (/^https?:\/\//i.test(url)) {
      return url;
    } else {
      return new URL(url, window.location.href).href;
    }
  }

  // 劫持请求
  private intecept() {
    this.inteceptFetch();
    this.inteceptXMLHttpRequest();
  }

  private inteceptFetch() {
    this.fetch = this.global.fetch.bind(this.global);
    this.global.fetch = (input: URL | RequestInfo, init?: AnyObject) => {
      // 解析请求 url 与各种参数
      let url: string;
      let params: Request | AnyObject;
      if (input instanceof URL) {
        url = input.href;
        params = init || {};
      } else if (typeof input === 'object') {
        url = input.url;
        params = input;
      } else {
        url = input;
        params = init || {};
      }
      const method = (params && params.method ? params.method : 'GET') as unknown as Method;
      const requestUrl = this.getFullRequestUrl(url);

      return new Promise((resolve, reject) => {
        const commonConfig = this.configCenter.getCommonConfig();
        const requestConfig = this.configCenter.getRequestConfig(requestUrl, method);

        // 指定 url 和 method 的配置比公共配置优先
        const requestCatcher = requestConfig?.requestCatcher || commonConfig.requestCatcher;
        const requestHanler = requestConfig?.requestHanler || commonConfig.requestHanler;
        const responseCatcher = requestConfig?.responseCatcher || commonConfig.responseCatcher;

        // 转换请求入参
        let requestParams: RequestPayload = {
          url: requestUrl,
          method,
          headers: params.headers || {},
          body: params.body,
        };

        if (requestCatcher) {
          requestParams = requestCatcher(requestParams);
        }

        // 转换返回数据
        const resResolver = (resp: Response, body: string) => {
          if (responseCatcher) {
            const transformedBody = responseCatcher({
              status: resp.status,
              statusText: resp.statusText,
              headers: convertHeadersToObject(resp.headers),
              body,
            });
            const { status, statusText } = transformedBody;
            const headers = new Headers({ ...transformedBody.headers });

            const response = new Response(transformedBody.body as BodyInit, { status, statusText, headers });
            Object.defineProperty(response, 'url', { value: requestUrl });
            resolve(response);
          } else {
            resolve(resp);
          }
        };

        // 替代真实请求
        const reqPayload = {
          ...params,
          ...requestParams,
        };
        console.log('requestHanler', requestConfig);
        if (requestHanler) {
          const mockResp = requestHanler(requestParams);
          const { status, statusText } = mockResp;
          const headers = new Headers({ ...mockResp.headers });

          const response = new Response(mockResp.body as BodyInit, { status, statusText, headers });
          Object.defineProperty(response, 'url', { value: requestUrl });
          resolve(response);
        } else {
          this.fetch(reqPayload.url, reqPayload)
            .then((response: Response) => {
              response.text().then((body) => resResolver(response, body));
            })
            .catch(reject);
        }
      });
    };
  }

  private inteceptXMLHttpRequest() {}

  saveRequestConfig(config: Config) {
    this.configCenter.saveRequestConfig(config);
  }

  saveCommonConfig(config: Config) {
    this.configCenter.saveCommonConfig(config);
  }
}
