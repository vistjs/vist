import { HTTPStatusCodes } from '../constants';
import { Interceptor } from '../types';

const HOOKS = [
  'replace',
  'method',
  'reqCookie',
  'reqCors',
  'reqHeaders',
  'reqBody',
  'statusCode',
  'resBody',
  'replaceStatus',
  'resCookie',
  'resCors',
  'resHeaders',
  'response',
];
class Matcher extends Interceptor {
  private hooks: {
    [key: string]: Function;
  };

  constructor(pattern: string) {
    super(pattern);
    this.hooks = {};
    HOOKS.forEach((name: string) => {
      //@ts-ignore setting hook props
      this[name] = (cb) => {
        this.tapHook(name, cb);
        return this;
      };
    });
    this.requestCatcher = this.requestCatcher.bind(this);
    this.requestHanler = this.requestHanler.bind(this);
    this.responseCatcher = this.responseCatcher.bind(this);
    return new Proxy(this, {
      get(target, name, receiver) {
        if (name === 'requestHanler') {
          if (!target.hooks.statusCode && !target.hooks.resBody) {
            return null;
          }
        }
        return Reflect.get(target, name, receiver);
      },
    });
  }

  private tapHook(name: string, cb: Function) {
    if (!this.hooks[name]) {
      this.hooks[name] = cb;
    }
    return this;
  }

  private callHook(name: string, args: any[]) {
    if (this.hooks[name]) {
      return this.hooks[name].apply(this, args);
    }
  }

  // replace,method,reqCookie,reqCors,reqHeaders,reqBody
  requestCatcher(params: RequestPayload): RequestPayload {
    let { url, method, headers, body } = params;
    url = this.callHook('replace', [params]) || url;
    method = this.callHook('method', [params]) || method;
    headers = this.callHook('reqHeaders', [params]) || headers;
    body = this.callHook('reqBody', [params]) || body;

    return {
      url,
      method,
      headers,
      body,
    };
  }

  // statusCode, resBody
  requestHanler(params: RequestPayload): Promise<ResponsePayload> {
    return new Promise((resolve) => {
      const { url, method } = params;
      const status = this.callHook('replaceStatus', [params]) || 200;
      const headers = this.callHook('resHeaders', [params]) || {};
      const resBody = this.callHook('resBody', [params]) || '';
      resolve({
        url,
        method,
        status,
        statusText: HTTPStatusCodes[status] || '',
        headers,
        body: resBody,
      });
    });
  }

  // replaceStatus,resCookie,resCors,resHeaders, response
  responseCatcher(params: ResponsePayload): ResponsePayload {
    const { url, method, status, statusText, headers, body } = params;
    const newStatus = this.callHook('replaceStatus', [params]) || status || 200;
    const newHeaders = this.callHook('resHeaders', [params]) || headers;
    this.callHook('response', [params]);
    return {
      url,
      method,
      status: newStatus,
      statusText,
      headers: newHeaders,
      body,
    };
  }
}

export default Matcher;