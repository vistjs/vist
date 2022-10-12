import { RecorderPlugin } from '../record/pluginable';

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

export type RecordInternalOptions = RecordOptions;

export type WatcherArgs<T extends RecordData, WatchersInstance = any, Recorder = any> = {
  recorder: Recorder;
  context: Window;
  listenStore: Set<Function>;
  emit: RecordEvent<T>;
  watchers: WatchersInstance;
};

export type RecordEvent<T extends RecordData> = (e: T) => void;

export type RecordData = {
  type: RecordType;
  time: number;
  data: eventWithTime;
  extras: Omit<RecordDbData, 'type' | 'time'>;
};

export type RecordDbData = {
  type: RecordType;
  time: number;
  dom?: { x: number; y: number };
  data?: {
    [k: string]: any;
  };
};

export enum RecordType {
  'MOUSE',
  'INPUT',
  'DRAG',
  'EVENT',
  'SCROLL',
  'CAPTURE',
}

export enum RecorderStatus {
  RUNNING = 'running',
  PAUSE = 'pause',
  HALT = 'halt',
}

export enum RecorderEventTypes {
  RECORD = 'record',
  PAUSE = 'pause',
  STOP = 'stop',
}

export type RecorderMiddleware = (data: RecordData, n: () => Promise<void>) => Promise<void>;
