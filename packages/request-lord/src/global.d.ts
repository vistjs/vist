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
  body: unknown;
};

declare type ResponsePayload = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
};

declare type FetchRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
};
