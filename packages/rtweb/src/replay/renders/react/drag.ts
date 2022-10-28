import { RecordDbData } from '../../../types';

const wm = new WeakMap();

export function renderDrag({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom?.x || 0, dom?.y || 0) as HTMLElement;
  const type = data?.type as any;
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
  if (type === 'dragend' || type === 'drop') {
    wm.delete(draggingNode);
  }
}
