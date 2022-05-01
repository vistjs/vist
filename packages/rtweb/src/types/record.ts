import { RecorderPlugin } from '../record/pluginable';

import { RecorderModule } from '../record';
import { watchers } from '../record/watchers';
import { eventWithTime } from 'rrweb/typings/types.d';

interface RecordOptionsBase {
  context?: Window;
  rootContext?: Window;
  rootRecorder?: RecorderModule;
  disableWatchers?: Array<keyof typeof watchers>;
}

export interface RecordOptions extends RecordOptionsBase {
  plugins?: RecorderPlugin[];
}

export interface RecordInternalOptions extends Required<RecordOptions> {
  context: Window;
}

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
  dom: { x: number; y: number };
  data?: {
    [k: string]: any;
  };
};

export enum RecordType {
  'MOUSE',
  'INPUT',
  'DRAG',
  'EVENT',
}

export enum RecorderStatus {
  RUNNING = 'running',
  PAUSE = 'pause',
  HALT = 'halt',
}

export type RecorderMiddleware = (data: RecordData, n: () => Promise<void>) => Promise<void>;
