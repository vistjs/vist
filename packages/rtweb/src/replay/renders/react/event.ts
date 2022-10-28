import { RecordDbData } from '../../../types';

export function renderEvent({ dom, data }: RecordDbData) {
  const node = document.elementFromPoint(dom?.x || 0, dom?.y || 0) as HTMLElement;
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
}
