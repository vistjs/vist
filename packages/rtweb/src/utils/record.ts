import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';

export function isClickEvent(data: any) {
  return (
    data.source === IncrementalSource.MouseInteraction &&
    (data.type === MouseInteractions.Click || data.type === MouseInteractions.DblClick)
  );
}

export function isMouseEvent(data: any) {
  return (
    data.source === IncrementalSource.MouseInteraction &&
    (data.type === MouseInteractions.Click ||
      data.type === MouseInteractions.DblClick ||
      data.type === MouseInteractions.MouseDown ||
      data.type === MouseInteractions.MouseUp)
  );
}

const MouseInteractionName = {
  [MouseInteractions.MouseUp]: 'mouseup',
  [MouseInteractions.MouseDown]: 'mousedown',
  [MouseInteractions.Click]: 'click',
  [MouseInteractions.DblClick]: 'dblClick',
};

export function getMouseEventName(data: any) {
  return MouseInteractionName[data.type as keyof typeof MouseInteractionName];
}

const nodePosMap: { [k: number | string]: { x: number; y: number } } = { '-99': { x: 0, y: 0 } };

export function setClientXY(nodeId: number, x: number, y: number) {
  nodePosMap['-99'] = nodePosMap[nodeId] = { x, y };
}

export function getClientXY(nodeId: number) {
  return nodePosMap[nodeId] || nodePosMap['-99'];
}

export function getEventTarget(event: Event): EventTarget | null {
  try {
    if ('composedPath' in event) {
      const path = event.composedPath();
      if (path.length) {
        return path[0];
      }
    } else if ('path' in event && (event as unknown as { path: EventTarget[] }).path.length) {
      return (event as unknown as { path: EventTarget[] }).path[0];
    }
    return event.target;
  } catch {
    return event.target;
  }
}
