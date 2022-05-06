import { APP_FLAG, RECORD_TABLE } from '../constant';
import localforage from 'localforage';

export const isDev = process.env.NODE_ENV === 'development';

export const version = '__VERSION__';

export function logError(e: Error | string): string {
  const msg = (e as Error).message || (e as string);
  console.error(`${APP_FLAG} Error: ${msg}`);
  return msg;
}

export function logWarn(e: Error | string): string {
  const msg = (e as Error).message || (e as string);
  console.warn(`${APP_FLAG} Warning: ${msg}`);
  return msg;
}

export function throttle(func: Function, wait: number, options: { leading?: boolean; trailing?: boolean } = {}): any {
  let context: any;
  let args: any;
  let result: any;
  let timeout: any = null;
  let previous = 0;

  const later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function (this: any) {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

type Procedure = (...args: any[]) => void;

type Options = {
  isImmediate?: boolean;

  // not standard
  isTrailing?: boolean;
};

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds: number,
  options: Options = {
    isImmediate: false,
    isTrailing: false,
  }
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;

    const doLater = function () {
      timeoutId = undefined;
      if (!options.isImmediate || options.isTrailing) {
        func.apply(context, args);
      }
    };

    const shouldCallNow = options.isImmediate && timeoutId === undefined;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  };
}

export function getTime(): number {
  return Date.now();
}

export const tempEmptyFn = () => {};
export const tempEmptyPromise = () => Promise.resolve();

export async function delay(t = 200): Promise<void> {
  return new Promise((r) => {
    setTimeout(() => r(), t);
  });
}

export function logAsciiLogo() {
  /* eslint-disable */
  return console.log(
    `%c
______ _                _____       _   
|_   _(_)              /  __ \\     | |  
  | |  _ _ __ ___   ___| /  \\/ __ _| |_ 
  | | | | '_ \` _ \\ / _ \\ |    / _\` | __|
  | | | | | | | | |  __/ \\__/\\ (_| | |_ 
  \\_/ |_|_| |_| |_|\\___|\\____/\\__,_|\\__|
    `,
    'color: #1475b2;'
  );
}

export function logBadge(opts: { title: string; content: string; titleColor?: string; backgroundColor?: string }) {
  const { title, content, titleColor, backgroundColor } = opts;
  const tColor = titleColor || '#606060';
  const bColor = backgroundColor || '#1475b2';

  const args = [
    '%c '.concat(title, ' %c ').concat(content, ' '),
    'padding: 1px; border-radius: 3px 0 0 3px; color: #fff; background: '.concat(tColor, ';'),
    'padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background: '.concat(bColor, ';'),
  ];
  console.log.apply(void 0, args);
}

export function logInfo() {
  logAsciiLogo();
  logBadge({ title: 'version', content: version });
  logBadge({ title: 'more info', content: 'github.com/letshare/rtweb' });
}

export function removeGlobalVariables() {
  const keys = Object.keys(window);
  const targetKeys = keys.filter((key) => {
    if (key) {
      if (key.startsWith('G_RECORD') || key.startsWith('G_REPLAY')) {
        return true;
      }
    }
  }) as (keyof Window)[];

  targetKeys.forEach((key) => {
    delete window[key];
  });
}

export async function getRecordsFromDB(dbName: string) {
  const store = localforage.createInstance({
    name: dbName,
  });
  try {
    const value = await store.getItem(RECORD_TABLE);
    return value;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export function getUrlParam(name: string) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r =
    window.location.search.substring(1).match(reg) ||
    window.location.hash.substring(window.location.hash.search(/\?/) + 1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
}

export function cloneKeys(obj: { [key: string]: any }, keys: string[]) {
  const ret: any = {};
  keys.forEach((k) => {
    ret[k] = obj[k];
  });
  return ret;
}

export function getEventTarget(event: Event): EventTarget | null {
  try {
    if ('composedPath' in event) {
      const path = event.composedPath();
      if (path.length) {
        return path[0];
      }
    } else if ('path' in event && (event as unknown as { path: EventTarget[] }).path.length) {
      return (event as unknown as { path: EventTarget[] }).path[0];
    }
    return event.target;
  } catch {
    return event.target;
  }
}

const supportedInputTypes = {
  color: true,
  date: true,
  datetime: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true,
} as any;

export function isTextInputElement(elem: HTMLInputElement) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

  if (nodeName === 'input') {
    return !!supportedInputTypes[elem.type];
  }

  if (nodeName === 'textarea') {
    return true;
  }

  return false;
}
