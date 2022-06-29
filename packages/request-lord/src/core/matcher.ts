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
  hooks: {
    [key: string]: Function;
  };

  constructor(pattern: string) {
    super(pattern);
    this.hooks = {};
    HOOKS.forEach((name: string) => {
      //@ts-ignore
      this[name] = (cb) => {
        this.tapHook(name, cb);
      };
    });
    this.requestCatcher = this.requestCatcher.bind(this);
    this.requestHanler = this.requestHanler.bind(this);
    this.responseCatcher = this.responseCatcher.bind(this);
    const that = this;
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

  tapHook(name: string, cb: Function) {
    if (!this.hooks[name]) {
      this.hooks[name] = cb;
    }
    return this;
  }

  callHook(name: string, args: any[]) {
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
  requestHanler(params: RequestPayload): ResponsePayload {
    let { url, method, body } = params;
    const status = this.callHook('replaceStatus', [params]) || 200;
    const headers = this.callHook('resHeaders', [params]) || {};
    const resBody = this.callHook('resBody', [params]) || '';
    return {
      url,
      method,
      status,
      statusText: HTTPStatusCodes[status] || '',
      headers,
      body: resBody,
    };
  }

  // replaceStatus,resCookie,resCors,resHeaders, response
  responseCatcher(params: ResponsePayload): ResponsePayload {
    let { url, method, status, statusText, headers, body } = params;
    status = this.callHook('replaceStatus', [params]) || status || 200;
    headers = this.callHook('resHeaders', [params]) || headers;
    this.callHook('response', [params]);
    return {
      url,
      method,
      status,
      statusText,
      headers,
      body,
    };
  }
}

export default Matcher;
