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
