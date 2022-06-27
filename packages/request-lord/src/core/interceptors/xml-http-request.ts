import Interceptor from '..';
import { HTTPStatusCodes } from '../../constants';
import { getFullRequestUrl } from '../utils';

class NotResolved {}

export default class XMLHttpRequestInterceptor {
  private host: Interceptor;
  private xhr: XMLHttpRequest;

  constructor(host: Interceptor) {
    this.host = host;
    this.xhr = (this.host.global as any).XMLHttpRequest.prototype;
    this.intercept();
  }

  intercept() {
    this.interceptOpen();
    this.interceptSend();
    this.interceptSetRequestHeader();
    this.interceptGetAllResponseHeaders();
    this.interceptGetResponseHeader();

    // intercept getters
    this.interceptReadyState();
    this.interceptStatus();
    this.interceptStatusText();
    this.interceptResponseText();
    this.interceptResponse();
    this.interceptResponseURL();
    this.interceptResponseXML();
  }

  private getGetter(key: string) {
    const descriptor = Object.getOwnPropertyDescriptor(this.xhr, key);
    if (descriptor) {
      return descriptor.get;
    }
    // @ts-ignore
    return this.xhr[key];
  }

  private interceptOpen() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;
    const original = this.xhr.open;
    Object.defineProperty(this.xhr, 'open', {
      get: function () {
        return (
          method: Method,
          url: string,
          async = true,
          user: string | null = null,
          password: string | null = null
        ) => {
          const requestUrl = getFullRequestUrl(url);
          const { requestCatcher, requestHanler, responseCatcher } = me.host.getHandlers(requestUrl, method);

          if (!this.bypassMock && (requestCatcher || requestHanler || responseCatcher)) {
            this.isMockRequest = true;
            this.requestInfo = {
              url: requestUrl,
              method,
            };
            this.requestArgs = [method, requestUrl, async, user, password];
            this.mockResponse = new NotResolved();
            return;
          }
          return original.call(this, method, requestUrl, async, user, password);
        };
      },
    });
    return this;
  }

  private interceptSend() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;
    const original = this.xhr.send;
    Object.defineProperty(this.xhr, 'send', {
      get: function () {
        return (body: unknown) => {
          if (this.isMockRequest) {
            const { requestCatcher, requestHanler, responseCatcher } = me.host.getHandlers(
              this.requestInfo.url,
              this.requestInfo.method
            );

            if (requestCatcher) {
              this.requestInfo = requestCatcher({
                ...this.requestInfo,
                body,
              });
              this.requestInfo.rawBody = body;
            }

            if (requestHanler) {
              const response = requestHanler(this.requestInfo);
              this.mockResponse = responseCatcher ? responseCatcher(response) : response;
              me.sendResult(this);
            } else {
              me.sendRemoteRequest(this);
            }
          }
          return original.call(this, body as Document);
        };
      },
    });
    return this;
  }

  // 用另一个 xhr 对象发起请求，并截获返回
  private sendRemoteRequest(xhr: XMLHttpRequestInstance) {
    const [method, , async, user, password] = xhr.requestArgs;
    const { requestInfo } = xhr;

    const newXhr = new XMLHttpRequest();
    Object.assign(newXhr, { isMockRequest: false, bypassMock: true });
    newXhr.onreadystatechange = () => {
      if (newXhr.readyState === 4) {
        const { responseCatcher } = this.host.getHandlers(requestInfo.url, requestInfo.method);
        const remoteResponse: ResponsePayload = {
          status: newXhr.status,
          statusText: newXhr.statusText,
          headers: newXhr
            .getAllResponseHeaders()
            .split('\r\n')
            .reduce((res: Record<string, string>, item: string) => {
              const [key, val] = item.split(':');
              if (key) {
                res[key.toLowerCase()] = val.trim();
              }
              return res;
            }, {} as Record<string, string>),
          body: newXhr.response,
        };
        xhr.mockResponse = responseCatcher ? responseCatcher(remoteResponse) : remoteResponse;
        this.sendResult(xhr);
      }
    };
    newXhr.open(
      requestInfo.method || (method as string),
      requestInfo.url,
      async as boolean,
      user as string,
      password as string
    );
    newXhr.send(xhr.requestInfo.rawBody as Document); // raw body
    return xhr;
  }

  private sendResult(xhr: XMLHttpRequest) {
    const isEventReady = typeof Event !== 'undefined' && typeof xhr.dispatchEvent === 'function';

    if (typeof xhr.onreadystatechange === 'function') {
      xhr.onreadystatechange(this.event('readystatechange'));
    } else if (isEventReady) {
      xhr.dispatchEvent(new Event('readystatechange'));
    }

    if (typeof xhr.onload === 'function') {
      xhr.onload(this.event('load'));
    } else if (isEventReady) {
      xhr.dispatchEvent(new Event('load'));
    }

    if (typeof xhr.onloadend === 'function') {
      xhr.onloadend(this.event('loadend'));
    } else if (isEventReady) {
      xhr.dispatchEvent(new Event('loadend'));
    }
  }

  private event(type: string) {
    return {
      type,
      target: null,
      currentTarget: null,
      eventPhase: 0,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      composed: false,
      timeStamp: 294973.8000000119,
      srcElement: null,
      returnValue: true,
      cancelBubble: false,
      path: [],
      NONE: 0,
      CAPTURING_PHASE: 0,
      AT_TARGET: 0,
      BUBBLING_PHASE: 0,
      composedPath: () => [],
      initEvent: () => void 0,
      preventDefault: () => void 0,
      stopImmediatePropagation: () => void 0,
      stopPropagation: () => void 0,
      isTrusted: false,
      lengthComputable: false,
      loaded: 1,
      total: 1,
    };
  }

  private interceptSetRequestHeader() {
    const original = this.xhr.setRequestHeader;
    Object.defineProperty(this.xhr, 'setRequestHeader', {
      get: function () {
        return (header: string, value: string) => {
          if (this.isMockRequest) {
            this.requestInfo.headers = this.requestInfo.headers || {};
            this.requestInfo.headers[header] = value;
            return;
          }
          return original.call(this, header, value);
        };
      },
    });
    return this;
  }

  private interceptGetAllResponseHeaders() {
    const original = this.xhr.getAllResponseHeaders;
    Object.defineProperty(this.xhr, 'getAllResponseHeaders', {
      get: function () {
        return () => {
          if (this.isMockRequest) {
            return Object.entries({ ...this.mockResponse.headers, 'x-powered-by': 'request-lord' })
              .map(([key, val]) => key.toLowerCase() + ': ' + val)
              .join('\r\n');
          }
          return original.call(this);
        };
      },
    });
    return this;
  }

  private interceptGetResponseHeader() {
    const original = this.xhr.getResponseHeader;
    Object.defineProperty(this.xhr, 'getResponseHeader', {
      get: function () {
        return (field: string) => {
          if (this.isMockRequest) {
            if (/^x-powered-by$/i.test(field)) {
              return 'request-lord';
            }
            const item = Object.entries(this.mockResponse.headers).find(([key]) => key.toLowerCase() === field);
            return item ? item[1] : null;
          }
          return original.call(this, field);
        };
      },
    });
    return this;
  }

  private interceptReadyState() {
    const original = this.getGetter('readyState');
    Object.defineProperty(this.xhr, 'readyState', {
      get: function () {
        if (this.isMockRequest) {
          if (this.mockResponse instanceof NotResolved) return 1; // OPENED

          return 4;
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }

  private interceptStatus() {
    const original = this.getGetter('status');
    Object.defineProperty(this.xhr, 'status', {
      get: function () {
        if (this.isMockRequest) {
          if (this.mockResponse instanceof NotResolved) return 0;

          return this.mockResponse.status;
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }

  private interceptStatusText() {
    const original = this.getGetter('statusText');
    Object.defineProperty(this.xhr, 'statusText', {
      get: function () {
        if (this.isMockRequest) {
          if (this.mockResponse instanceof NotResolved) return '';

          return HTTPStatusCodes[this.mockResponse.status] || '';
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }

  private interceptResponseText() {
    const original = this.getGetter('responseText');
    Object.defineProperty(this.xhr, 'responseText', {
      get: function () {
        if (this.isMockRequest) {
          if (this.mockResponse instanceof NotResolved) return '';

          const data = this.mockResponse.body;
          return typeof data === 'string' ? data : JSON.stringify(data);
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }

  private interceptResponseURL() {
    const original = this.getGetter('responseURL');
    Object.defineProperty(this.xhr, 'responseURL', {
      get: function () {
        if (this.isMockRequest) {
          return this.requestInfo.url;
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }

  private interceptResponseXML() {
    const original = this.getGetter('responseXML');
    Object.defineProperty(this.xhr, 'responseXML', {
      get: function () {
        if (this.isMockRequest) {
          return this.responseType === 'document' ? this.response : null;
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }

  private interceptResponse() {
    const original = this.getGetter('response');
    Object.defineProperty(this.xhr, 'response', {
      get: function () {
        if (this.isMockRequest) {
          if (this.mockResponse instanceof NotResolved) return null;

          const type = this.responseType;
          const mockBody = this.mockResponse.body;
          // An empty responseType string is the same as "text", the default type.
          if (type === 'text' || type === '') {
            return this.responseText;
          }
          // The response is a JavaScript ArrayBuffer containing binary data.
          if (type === 'arraybuffer' && typeof ArrayBuffer === 'function') {
            return mockBody instanceof ArrayBuffer ? mockBody : null;
          }
          // The response is a Blob object containing the binary data.
          if (type === 'blob' && typeof Blob === 'function') {
            return mockBody instanceof Blob ? mockBody : null;
          }
          // The response is an HTML Document or XML XMLDocument, as appropriate based on the MIME type of
          // the received data. See HTML in XMLHttpRequest to learn more about using XHR to fetch HTML content.
          if (type === 'document' && (typeof Document === 'function' || typeof XMLDocument === 'function')) {
            return mockBody instanceof Document || mockBody instanceof XMLDocument ? mockBody : null;
          }
          // The response is a JavaScript object created by parsing the contents of received data as JSON.
          if (type === 'json') {
            if (typeof mockBody === 'object') {
              return mockBody;
            }
            if (typeof mockBody === 'string') {
              try {
                return JSON.parse(mockBody);
              } catch (err) {
                // eslint-disable-line
                // console.warn('The mock response is not compatible with the responseType json: ' + err.message);
                return null;
              }
            }
            return null;
          }
          return mockBody;
        }
        return typeof original === 'function' ? original.call(this) : original;
      },
    });
    return this;
  }
}
