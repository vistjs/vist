import Interceptor from '..';
import { convertHeadersToObject, getFullRequestUrl } from '../utils';

export default class FetchInterceptor {
  private host: Interceptor;
  private fetch: (input: URL | RequestInfo, init?: AnyObject) => Promise<Response>;

  constructor(host: Interceptor) {
    this.host = host;
    this.fetch = this.host.global.fetch.bind(this.host.global);
    this.intercept();
  }

  intercept() {
    this.host.global.fetch = (input: URL | RequestInfo, init?: AnyObject) => {
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
      const requestUrl = getFullRequestUrl(url);

      return new Promise((resolve, reject) => {
        const { requestCatcher, requestHanler, responseCatcher } = this.host.getHandlers(requestUrl, method);

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
              url: requestUrl,
              method,
              status: resp.status,
              statusText: resp.statusText,
              headers: convertHeadersToObject(resp.headers),
              body,
            });
            const { status, statusText } = transformedBody;
            const headers = new Headers({ ...transformedBody.headers, 'x-powered-by': 'request-lord' });

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
        if (requestHanler) {
          requestHanler(requestParams).then((mockResp) => {
            const { status, statusText } = mockResp;
            const headers = new Headers({ ...mockResp.headers });

            const response = new Response(mockResp.body as BodyInit, { status, statusText, headers });
            Object.defineProperty(response, 'url', { value: requestUrl });
            resolve(response);
          });
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
}
