import type { RecordData } from '../../types';
import { RecordType } from '../../constants';

const wm = new WeakMap();

export function renderDrag({ dom, data }: RecordData<RecordType.DRAG>) {
  if (!dom) return;
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;
  const type = data.type;
  const eventData = {
    ...data,
    bubbles: true,
    cancelable: true,
  } as any;

  const draggingInfo = eventData.draggingInfo;
  Reflect.deleteProperty(eventData, 'draggingInfo');

  if (data.relatedTarget) {
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
