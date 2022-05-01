import { RecordDbData } from '../../../types';
import ReactTestUtils from 'react-dom/test-utils';

const methodMap = {
  mouseenter: 'mouseEnter',
  mouseleave: 'mouseLeave',
} as any;

export function renderEvent({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;
  node &&
    node.dispatchEvent(
      new MouseEvent(data?.type, {
        ...data,
      })
    );
  const method = methodMap[data?.type] || data?.type;
  // react的mouseenter和mouseleave是由mouseover和mouseover计算出来的 不是mouseenter和mouseleave触发的
  node && ReactTestUtils.Simulate[method as keyof typeof ReactTestUtils.Simulate](node, data as any);
}
