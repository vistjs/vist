import ReactTestUtils from 'react-dom/test-utils';
import { RecordDbData } from '../../../types';

export function renderMouse({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;
  // antd slider使用mousedown client坐标
  // ReactTestUtils.Simulate.mouseDown(node, { clientX: data.x, clientY: data.y });
  node.dispatchEvent(
    new MouseEvent(data?.type, {
      bubbles: true,
      cancelable: true,
      clientX: data?.x,
      clientY: data?.y,
    })
  );
}

export function renderInput({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLInputElement;
  node.value = data?.text;
  // ReactTestUtils.Simulate.change(node);
  node.dispatchEvent(
    new InputEvent('input', {
      data: data?.text,
      bubbles: true,
      cancelable: true,
    })
  );
}

//@ts-ignore xxxx
window.ReactTestUtils = ReactTestUtils;
