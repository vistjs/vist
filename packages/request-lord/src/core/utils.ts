export const convertHeadersToObject = (headers: Headers): StringKeyValue => {
  const result: StringKeyValue = {};
  headers.forEach((val: string, key: string) => {
    result[key.toLocaleLowerCase()] = val;
  });
  return result;
};

export const getFullRequestUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  } else {
    return new URL(url, window.location.href).href;
  }
};
