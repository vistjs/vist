import ConfigCenter, { Config } from './ConfigCenter';
import { convertHeadersToObject, convertObjectToHeaders } from './utils/fetchUtils';

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

  private fetch;

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
    this.global.fetch = (input: string | FetchRequest, init: AnyObject) => {
      let url: string;
      let params: FetchRequest | AnyObject;
      if (typeof input === 'object') {
        url = input.url;
        params = input;
      } else {
        url = input;
        params = init || {};
      }
      const method = (params && params.method ? params.method : 'GET') as unknown as Method;
      const requestUrl = this.getFullRequestUrl(url);
      console.log('url:', url, requestUrl);

      return new Promise((resolve, reject) => {
        const commonConfig = this.configCenter.getCommonConfig();
        const requestConfig = this.configCenter.getRequestConfig(requestUrl, method);

        // 指定 url 和 method 的配置比公共配置优先

        const requestCatcher = requestConfig?.requestCatcher || commonConfig.requestCatcher;
        const requestHanler = requestConfig?.requestHanler || commonConfig.requestHanler;
        const responseCatcher = requestConfig?.responseCatcher || commonConfig.responseCatcher;

        let requestParams: RequestPayload = {
          url: requestUrl,
          method,
          headers: params.headers || {},
          body: params.body,
        };

        if (requestCatcher) {
          requestParams = requestCatcher(requestParams);
        }

        const resResolver = (resp: Response, body) => {
          let result = resp;
          if (responseCatcher) {
            result = {
              ...result,
              ...responseCatcher({
                status: resp.status,
                statusText: resp.statusText,
                headers: convertHeadersToObject(resp.headers),
                body: resp.body,
              }),
            };
          }
        };

        // if (!mockItem) {
        //   me.fetch(requestUrl, params).then(resolve).catch(reject);
        //   return;
        // }

        // const requestInfo = me.getRequestInfo({ ...params, url: requestUrl, method: method as HttpVerb });
        // const remoteInfo = mockItem?.getRemoteInfo(requestUrl);
        // if (remoteInfo) {
        //   params.method = remoteInfo.method || method;
        //   me.fetch(remoteInfo.url, params)
        //     .then((fetchResponse: FetchResponse) => {
        //       me.sendRemoteResult(fetchResponse, mockItem, requestInfo, resolve);
        //     })
        //     .catch(reject);
        //   return;
        // }

        // me.doMockRequest(mockItem, requestInfo, resolve).then((isBypassed) => {
        //   if (isBypassed) {
        //     me.fetch(requestUrl, params).then(resolve).catch(reject);
        //   }
        // });
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
