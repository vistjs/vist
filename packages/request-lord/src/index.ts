import Matcher from './core/matcher';
import Inteceptor from './core';

const inteceptor = new Inteceptor();

export default function lord(pattern: string) {
  const m = new Matcher(pattern);
  inteceptor.saveRequestConfig({
    pattern,
    requestCatcher: m.requestCatcher,
    requestHanler: m.requestHanler,
    responseCatcher: m.responseCatcher,
  });
  return m;
}
