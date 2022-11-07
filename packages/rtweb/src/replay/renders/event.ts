import type { RecordData } from '../../types';
import { RecordType } from '../../constants';

export function renderEvent({ dom, data }: RecordData<RecordType.EVENT>) {
  if (!dom) return;
  const node = document.elementFromPoint(dom.x, dom.y) as HTMLElement;
  const eventData = {
    bubbles: true,
    cancelable: true,
    ...data,
  } as any;
  // react will deduction mouseover from mouseout relatedTarget
  // TODO check vue
  if (data.relatedTarget && data.type !== 'mouseover') {
    eventData.relatedTarget = document.elementFromPoint(
      eventData.relatedTarget.x,
      eventData.relatedTarget.y
    ) as HTMLElement;
  } else {
    eventData!.relatedTarget = null;
  }
  const event = new MouseEvent(data.type, eventData);
  node && node.dispatchEvent(event);
}
