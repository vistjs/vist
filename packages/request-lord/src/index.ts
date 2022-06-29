import Matcher from './core/matcher';
import Inteceptor from './core';
export * from './types';

const inteceptor = new Inteceptor();

export default function lord(pattern: string) {
  const m = new Matcher(pattern);
  const config = { pattern };
  Object.setPrototypeOf(config, m);
  inteceptor.saveRequestConfig(config);
  return m;
}
