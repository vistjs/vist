import ReactTestUtils from 'react-dom/test-utils';
import { RecordDbData } from '../../../types';
import { isTextInputElement } from '../../../utils';

export function renderMouse({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;

  if (data?.type === 'blur') {
    if ('blur' in (node as Node as HTMLElement)) {
      (node as Node as HTMLElement).blur();
    }
  } else if (data?.type === 'focus') {
    if ((node as Node as HTMLElement).focus) {
      (node as Node as HTMLElement).focus({
        preventScroll: true,
      });
    }
  } else {
    node.dispatchEvent(
      new MouseEvent(data?.type, {
        bubbles: true,
        cancelable: false,
        ...data,
      })
    );
  }
}

export async function renderInput({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLInputElement;
  if (isTextInputElement(node)) {
    const descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, 'value');
    const get = descriptor!.get;
    // react canot use node.value set input text value, ,will not trigger change. react use input to trigger change
    Object.defineProperty(node, 'value', {
      configurable: true,
      get: function () {
        return data?.text;
      },
    });
    node.dispatchEvent(
      new InputEvent('input', {
        data: data?.text,
        bubbles: true,
        cancelable: false,
      })
    );
    Object.defineProperty(node, 'value', {
      configurable: true,
      get,
    });
    node.value = data?.text;
  } else if (node.hasOwnProperty('checked')) {
    node.checked = data?.isChecked;
    node.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: false,
      })
    );
  } else {
    // trigger select
    node.value = data?.text;
    node.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: false,
      })
    );
  }
  // console.log('renderInput', dom, node, data);
  // ReactTestUtils.Simulate.change(node);
}
