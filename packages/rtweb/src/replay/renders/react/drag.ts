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
  const type = data?.eventType as keyof typeof ReactTestUtils.Simulate;
  const eventData = {
    ...data,
    bubbles: true,
    cancelable: true,
    isTrusted: true,
  } as any;

  const draggingInfo = eventData.draggingInfo;
  Reflect.deleteProperty(eventData, 'type');
  Reflect.deleteProperty(eventData, 'eventType');
  Reflect.deleteProperty(eventData, 'time');
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

  const method = methodMap[type] || type;
  // Simulate触发不了ref的node监听的事件，因为它必须收集dom上的listener
  // ReactTestUtils.Simulate[method as keyof typeof ReactTestUtils.Simulate](node, eventData as any);
}
