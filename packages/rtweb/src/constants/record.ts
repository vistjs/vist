import { IncrementalSource, MouseInteractions } from 'rrweb';

export enum RecordType {
  'MOUSE',
  'INPUT',
  'DRAG',
  'EVENT',
  'SCROLL',
  'CAPTURE',
}

export enum RecorderEventTypes {
  INIT = 'init',
  RECORD = 'record',
  PAUSE = 'pause',
  STOP = 'stop',
}

export const sourceName = {
  [IncrementalSource.Mutation]: 'Mutation',
  [IncrementalSource.MouseMove]: 'MouseMove',
  [IncrementalSource.MouseInteraction]: 'MouseInteraction',
  [IncrementalSource.Scroll]: 'Scroll',
  [IncrementalSource.ViewportResize]: 'ViewportResize',
  [IncrementalSource.Input]: 'Input',
  [IncrementalSource.TouchMove]: 'TouchMove',
  [IncrementalSource.MediaInteraction]: 'MediaInteraction',
  [IncrementalSource.StyleSheetRule]: 'StyleSheetRule',
  [IncrementalSource.CanvasMutation]: 'CanvasMutation',
  [IncrementalSource.Font]: 'Font',
  [IncrementalSource.Log]: 'Log',
  [IncrementalSource.Drag]: 'Drag',
  [IncrementalSource.StyleDeclaration]: 'StyleDeclaration',
};

export const MouseInteractionName = {
  [MouseInteractions.MouseUp]: 'MouseUp',
  [MouseInteractions.MouseDown]: 'MouseDown',
  [MouseInteractions.Click]: 'Click',
  [MouseInteractions.ContextMenu]: 'ContextMenu',
  [MouseInteractions.DblClick]: 'DblClick',
  [MouseInteractions.Focus]: 'Focus',
  [MouseInteractions.Blur]: 'Blur',
  [MouseInteractions.TouchStart]: 'TouchStart',
  [MouseInteractions.TouchMove_Departed]: 'TouchMove_Departed',
  [MouseInteractions.TouchEnd]: 'TouchEnd',
  [MouseInteractions.TouchCancel]: 'TouchCancel',
};
