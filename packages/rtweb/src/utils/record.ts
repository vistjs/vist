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
      data.type === MouseInteractions.Blur ||
      data.type === MouseInteractions.Focus ||
      data.type === MouseInteractions.MouseDown ||
      data.type === MouseInteractions.MouseUp)
  );
}

const MouseInteractionName = {
  [MouseInteractions.MouseUp]: 'mouseup',
  [MouseInteractions.MouseDown]: 'mousedown',
  [MouseInteractions.Click]: 'click',
  [MouseInteractions.DblClick]: 'dblClick',
  [MouseInteractions.Blur]: 'blur',
  [MouseInteractions.Focus]: 'focus',
};

export function getMouseEventName(data: any) {
  return MouseInteractionName[data.type as keyof typeof MouseInteractionName];
}

const nodePosMap: { [k: number | string]: { x: number; y: number } } = { '-99': { x: 0, y: 0 } };

export function setClientXY(nodeId: number, x: number, y: number) {
  nodePosMap['-99'] = nodePosMap[nodeId] = { x, y };
}

export function getClientXY(nodeId: any) {
  if (typeof nodeId === 'number') {
    return nodePosMap[nodeId] || nodePosMap['-99'];
  } else {
    const id = nodeId['__sn']?.id;
    return nodePosMap[id] || nodePosMap['-99'];
  }
}

export function getNodeClientXY(node: any) {
  const id = node['__sn']?.id;
  if (typeof id === 'undefined') return null;
  return nodePosMap[id];
}
