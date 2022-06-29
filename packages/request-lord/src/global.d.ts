declare enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  ANY = 'ANY',
}

declare type StringKeyValue = {
  [key: string]: string;
};

declare type AnyObject = {
  [key: string]: unknown;
};

declare type RequestPayload = {
  url: string;
  method: Method;
  headers: Record<string, string> | unknown;
  body?: unknown;
  rawBody?: unknown;
};

declare type ResponsePayload = {
  url: string;
  method: Method;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  delay?: number;
};

declare type FetchRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

declare interface XMLHttpRequestInstance extends XMLHttpRequest {
  isMockRequest: string;
  mockResponse: ResponsePayload;
  requestInfo: RequestPayload;
  requestArgs: (Method | string | boolean | null)[];
}
