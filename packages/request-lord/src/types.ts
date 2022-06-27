interface MockConfig {
  url: string; // 请求的完整 url，包含 query 参数等，同时亦作为 id
  method: string; // 请求的方法
  delay?: number; // 请求的耗时
  status?: number; // 返回码
  header?: { [key: string]: string }; // 返回头
  body?: string; // 返回体
}

interface Configs extends Array<MockConfig> {}

export class Inteceptor {
  constructor(url: string | MockConfig) {}

  // 保留匹配的请求
  includeFilter(filter: string): Inteceptor {
    return this;
  }

  // 排除的请求（优先级比匹配高）
  excludeFilter(filter: string): Inteceptor {
    return this;
  }

  // 设置 302 重定向
  replace(url: string): Inteceptor {
    return this;
  }

  // 返回指定状态码（不发送请求）
  statusCode(code: number): Inteceptor {
    return this;
  }

  // 修改状态码（发送请求后）
  replaceStatus(code: number): Inteceptor {
    return this;
  }

  // 修改请求方法
  method(method: string): Inteceptor {
    return this;
  }

  // 设置请求延时
  reqDelay(delay: number): Inteceptor {
    return this;
  }

  // 设置响应延时
  resDelay(delay: number): Inteceptor {
    return this;
  }

  // 设置请求 Cookie
  reqCookie(cookies: { [key: string]: string }): Inteceptor {
    return this;
  }

  // 设置响应 Cookie
  resCookie(cookies: {
    [key: string]:
      | string
      | {
          value: string;
          expires?: string;
          maxAge?: number;
          domain?: string;
          path?: string;
          secure?: boolean;
          httpOnly?: boolean;
          sameSite?: string;
        };
  }): Inteceptor {
    return this;
  }

  // 设置请求 CORS
  reqCors(configs: { origin?: string; method?: string; headers?: string }): Inteceptor {
    return this;
  }

  // 设置响应 CORS
  resCors(configs: {
    origin?: string;
    exposeHeaders?: string;
    allowHeaders?: string;
    maxAge?: number;
    credentails?: boolean;
    methods?: string;
  }): Inteceptor {
    return this;
  }

  // 设置请求头
  reqHeaders(headers: { [key: string]: string }): Inteceptor {
    return this;
  }

  // 设置响应头
  resHeaders(headers: { [key: string]: string }): Inteceptor {
    return this;
  }

  // 设置请求体
  reqBody(body: string): Inteceptor {
    return this;
  }

  // 设置响应体
  resBody(body: string): Inteceptor {
    return this;
  }
}
