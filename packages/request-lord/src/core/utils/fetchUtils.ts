export const convertHeadersToObject = (headers: Headers): StringKeyValue => {
  const result: StringKeyValue = {};
  headers.forEach((val: string, key: string) => {
    result[key.toLocaleLowerCase()] = val;
  });
  return result;
};
