import { RecorderPlugin } from '../record/pluginable';
import { RecordType } from '../constants';
import { RecorderModule } from '../record';
import { watchers } from '../record/watchers';
import { eventWithTime } from 'rrweb/typings/types.d';
export interface RecordOptions {
  context?: Window;
  rootContext?: Window;
  rootRecorder?: RecorderModule;
  disableWatchers?: Array<keyof typeof watchers>;
  plugins?: RecorderPlugin[];
  hotkeys?: {
    stop?: string;
    capture?: string;
  };
}

export type RecordInternalOptions = RecordOptions & {
  context: Window;
  disableWatchers: Array<keyof typeof watchers>;
};

export type WatcherArgs<WatchersInstance, Recorder> = {
  recorder: Recorder;
  context: Window;
  listenStore: Set<Function>;
  emit: (e: RecordData) => void;
  watchers: WatchersInstance;
};

type TypeData = {
  [RecordType.MOUSE]: { clientX: number; clientY: number; type: string };
  [RecordType.INPUT]: { text: string; isChecked: boolean };
  [RecordType.DRAG]: {
    button: number;
    buttons: number;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    type: 'drag' | 'dragstart' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop';
    relatedTarget?: { x: number; y: number };
    draggingInfo?: { x: number; y: number };
  };
  [RecordType.EVENT]: {
    clientX: number;
    clientY: number;
    pageX: string;
    pageY: number;
    screenX: number;
    screenY: string;
    type: 'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout';
    relatedTarget?: { x: number; y: number };
  };
  [RecordType.SCROLL]: { x: number; y: number; id: number };
  [RecordType.CAPTURE]: { id: number };
};

export type RecordData<T extends RecordType = RecordType> = {
  type: T;
  time: number;
  data: TypeData[T];
  dom?: { x: number; y: number };
  eventWithTime?: eventWithTime;
};

export type RecorderMiddleware = (data: RecordData, n: () => Promise<void>) => Promise<void>;
