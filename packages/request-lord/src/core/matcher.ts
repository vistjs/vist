import { Inteceptor } from '../types';

class Matcher extends Inteceptor {
  _url: string; // 请求的完整 url，包含 query 参数等，同时亦作为 id
  _method: Method; // 请求的方法
  _reqDelay: number; // 请求的耗时
  _reqBody: any; // 请求体
  _reqHeaders: { [key: string]: string };
  _status: number; // 返回码
  _resHeaders: { [key: string]: string };
  _resBody: any; // 返回体

  constructor(pattern: string) {
    super(pattern);
  }

  method(newMethod: Method) {
    this._method = newMethod;
    return this;
  }

  resBody(body: any) {
    this._reqBody = body;
    return this;
  }

  requestCatcher(params: RequestPayload): RequestPayload {
    let { url, method, headers, body } = params;
    return {
      url: this._url || url,
      method: this._method || method,
      headers: this._reqHeaders || headers,
      body: this._reqBody || body,
    };
  }

  requestHanler(params: RequestPayload): ResponsePayload {
    let { url, method, headers, body } = params;

    return {
      status: this._status,
      statusText: '', // TODO
      headers: this._resHeaders,
      body: this._resBody,
    };
  }

  responseCatcher(params: ResponsePayload): ResponsePayload {
    let { status, statusText, headers, body } = params;
    return {
      status: this._status || status,
      statusText,
      headers: this._resHeaders || headers,
      body: this._resBody || body,
    };
  }
}

function trackClass(cls: typeof Matcher) {
  return new Proxy(cls, {
    construct(target, args) {
      const obj = new target(args[0]);
      return new Proxy(obj, {
        get(target, name, receiver) {
          console.log('MatcherModule get', target, name, receiver);
          if (name === 'requestHanler') {
            if (!target._status && !target._resHeaders && !target._resBody) {
              return null;
            }
          }
          return Reflect.get(target, name, receiver);
        },
      });
    },
  });
}

export default trackClass(Matcher);
