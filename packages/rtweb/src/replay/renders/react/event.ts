import { RecordDbData } from '../../../types';
import ReactTestUtils from 'react-dom/test-utils';

const methodMap = {
  mouseenter: 'mouseEnter',
  mouseleave: 'mouseLeave',
  mouseover: 'mouseOver',
  mouseout: 'mouseOut',
} as any;

export function renderEvent({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;
  // react will deduction mouseover from mouseout relatedTarget
  if (data?.relatedTarget && data?.type !== 'mouseover') {
    data.relatedTarget = document.elementFromPoint(data.relatedTarget.x, data.relatedTarget.y) as HTMLElement;
  } else {
    data!.relatedTarget = null;
  }
  const event = new MouseEvent(data?.type, {
    bubbles: true,
    cancelable: true,
    ...data,
  });
  node && node.dispatchEvent(event);
  // in react mouseenter and mouseleave is simulated by mouseover mouseout， not mouseenter and mouseleave trigger
  // const method = methodMap[data?.type] || data?.type;
  // node && ReactTestUtils.Simulate[method as keyof typeof ReactTestUtils.Simulate](node, data as any);
}
