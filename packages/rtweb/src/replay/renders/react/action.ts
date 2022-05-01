import ReactTestUtils from 'react-dom/test-utils';
import { RecordDbData } from '../../../types';

export function renderMouse({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;

  node.dispatchEvent(
    new MouseEvent(data?.type, {
      bubbles: true,
      cancelable: false,
      ...data,
    })
  );
}

export async function renderInput({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLInputElement;
  if (node.hasOwnProperty('value')) {
    const descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, 'value');
    const get = descriptor!.get;
    // react canot use node.value set, ,will not trigger change. react use input to trigger change
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
  } else {
    node.checked = data?.isChecked;
  }
  // console.log('renderInput', dom, node, data);
  // ReactTestUtils.Simulate.change(node);
  node.dispatchEvent(
    new Event('change', {
      bubbles: true,
      cancelable: false,
    })
  );
}
