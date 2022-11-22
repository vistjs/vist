import type { RecordData } from '../../types';
import { RecordType, DOCUMENT_NODE_ID } from '../../constants';
import { isTextInputElement } from '../../utils';

export function renderMouse({ dom, data }: RecordData<RecordType.MOUSE>) {
  if (!dom) return;

  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;

  if (data.type === 'blur') {
    if ('blur' in (node as Node as HTMLElement)) {
      (node as Node as HTMLElement).blur();
    }
  } else if (data.type === 'focus') {
    if ((node as Node as HTMLElement).focus) {
      (node as Node as HTMLElement).focus({
        preventScroll: true,
      });
    }
  } else {
    node.dispatchEvent(
      new MouseEvent(data.type, {
        bubbles: true,
        cancelable: true,
        ...data,
      })
    );
  }
}

export function renderInput({ dom, data }: RecordData<RecordType.INPUT>) {
  if (!dom) return;
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLInputElement;
  if (isTextInputElement(node)) {
    const descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, 'value');
    const get = descriptor!.get;
    const set = descriptor!.set;
    // react canot use node.value set input text value, ,will not trigger change. react use input to trigger change
    Object.defineProperty(node, 'value', {
      configurable: true,
      get: function () {
        return data.text;
      },
    });
    node.dispatchEvent(
      new InputEvent('input', {
        data: data.text,
        bubbles: true,
        cancelable: false,
      })
    );
    Object.defineProperty(node, 'value', {
      configurable: true,
      get,
      set,
    });
    node.value = data.text;
  } else if (node.hasOwnProperty('checked')) {
    node.checked = data.isChecked;
    node.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: false,
      })
    );
  } else {
    // trigger select
    node.value = data.text;
    node.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: false,
      })
    );
  }
}

export function renderScroll({ dom, data }: RecordData<RecordType.SCROLL>) {
  if (data.id === -1) {
    return;
  }
  if (data.id === DOCUMENT_NODE_ID) {
    // nest iframe content document
    document.defaultView!.scrollTo({
      top: data.y,
      left: data.x,
      behavior: 'smooth',
    });
  } else {
    if (!dom) return;
    const target = document.elementFromPoint(dom.x, dom.y) as Element;
    try {
      (target as Node as Element).scrollTop = data.y;
      (target as Node as Element).scrollLeft = data.x;
    } catch (error) {
      /**
       * Seldomly we may found scroll target was removed before
       * its last scroll event.
       */
    }
  }
}
