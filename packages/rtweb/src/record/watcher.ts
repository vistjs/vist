import { WatcherArgs, RecordEvent, RecordData, RecordType, RecordInternalOptions } from '../types';
import { debounce, throttle, getTime } from '../utils';

import { RecorderModule } from '.';

export type WatcherOptions<T extends RecordData> = WatcherArgs<T, Map<string, Watcher<RecordData>>, RecorderModule>;
export class Watcher<T extends RecordData> {
  recorder: RecorderModule;
  context: Window;
  private emit: RecordEvent<RecordData>;
  options: WatcherArgs<T>;
  recordOptions: RecordInternalOptions;

  constructor(options: WatcherArgs<T>) {
    const { emit, context, recorder } = options;
    this.options = options;
    this.recorder = recorder;
    this.context = context;
    this.recordOptions = context.G_RECORD_OPTIONS || window.G_RECORD_OPTIONS || {};
    this.emit = emit;
    this.init(options);
  }

  protected init(options: WatcherOptions<T>): void {}

  public uninstall(fn: Function) {
    this.options.listenStore.add(fn);
  }

  public emitData(
    type: RecordType,
    record: RecordData['data'] | null, // origin data from rrweb
    extras: RecordData['extras'], // data to save in db
    time = getTime(),
    callback?: (data: RecordData) => T
  ) {
    const data = {
      type,
      time,
      data: record,
      extras,
    } as RecordData;

    if (callback) {
      return this.emit(callback(data));
    }

    this.emit(data);
  }

  public registerEvent(options: {
    context: Window | Document;
    eventTypes: string[];
    handleFn: (...args: any[]) => void;
    listenerOptions?: AddEventListenerOptions;
    type?: 'throttle' | 'debounce';
    optimizeOptions?: { [key: string]: boolean };
    waitTime?: number;
  }) {
    const { context, eventTypes, handleFn, listenerOptions, type, optimizeOptions, waitTime = 0 } = options;
    let listenerHandle: (...args: any[]) => void;
    if (type === 'throttle') {
      listenerHandle = throttle(handleFn, waitTime, optimizeOptions);
    } else if (type === 'debounce') {
      listenerHandle = debounce(handleFn, waitTime, optimizeOptions);
    } else {
      listenerHandle = handleFn;
    }

    eventTypes
      .map((type) => (fn: (e: Event) => void) => {
        context.addEventListener(type, fn, listenerOptions);
      })
      .forEach((handle) => handle(listenerHandle));

    this.uninstall(() => {
      eventTypes.forEach((type) => {
        context.removeEventListener(type, listenerHandle, listenerOptions);
      });
    });
  }
}
