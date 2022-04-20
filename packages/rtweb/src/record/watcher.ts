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
    record: RecordData['data'], // 原始rrweb的数据结构，用于分析和log，不保存db
    extras: any, // 保存db的数据
    time = getTime(),
    callback?: (data: RecordData) => T
  ) {
    const data = {
      type,
      data: record,
      extras,
      time,
    } as RecordData;

    if (callback) {
      return this.emit(callback(data));
    }

    this.emit(data);
  }

  public registerEvent(options: {
    context: Window;
    eventTypes: string[];
    handleFn: (...args: any[]) => void;
    listenerOptions: AddEventListenerOptions;
    type: 'throttle' | 'debounce';
    optimizeOptions: { [key: string]: boolean };
    waitTime: number;
  }) {
    const { context, eventTypes, handleFn, listenerOptions, type, optimizeOptions, waitTime } = options;
    let listenerHandle: (...args: any[]) => void;
    if (type === 'throttle') {
      listenerHandle = throttle(handleFn, waitTime, optimizeOptions);
    } else {
      listenerHandle = debounce(handleFn, waitTime, optimizeOptions);
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
