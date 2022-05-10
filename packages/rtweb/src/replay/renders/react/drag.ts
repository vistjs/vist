import ReactTestUtils from 'react-dom/test-utils';
import { RecordDbData } from '../../../types';

const methodMap = {
  dragstart: 'dragStart',
  dragend: 'dragEnd',
  dragenter: 'dragEnter',
  dragleave: 'dragLeave',
  dragover: 'dragOver',
} as any;

const wm = new WeakMap();

export function renderDrag({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;
  const type = data?.type as keyof typeof ReactTestUtils.Simulate;
  const eventData = {
    ...data,
    bubbles: true,
    cancelable: true,
  } as any;

  const draggingInfo = eventData.draggingInfo;
  Reflect.deleteProperty(eventData, 'draggingInfo');

  if (eventData.relatedTarget) {
    eventData.relatedTarget = document.elementFromPoint(
      eventData.relatedTarget.x,
      eventData.relatedTarget.y
    ) as HTMLElement;
  }

  const draggingNode = draggingInfo ? (document.elementFromPoint(draggingInfo.x, draggingInfo.y) as HTMLElement) : node;
  if (wm.get(draggingNode)) {
    eventData.dataTransfer = wm.get(draggingNode);
  } else {
    eventData.dataTransfer = new DataTransfer();
    wm.set(draggingNode, eventData.dataTransfer);
  }
  node.dispatchEvent(
    new DragEvent(type, {
      bubbles: true,
      cancelable: true,
      dataTransfer: eventData.dataTransfer,
    })
  );
  //@ts-ignore xxx
  if (type === 'dragend' || type === 'drop') {
    wm.delete(draggingNode);
  }

  // Simulate canot trigger the listener no the real node，it collect listener on react props
  // so react-dnd will
  // const method = methodMap[type] || type;
  // ReactTestUtils.Simulate[method as keyof typeof ReactTestUtils.Simulate](node, eventData as any);
}
