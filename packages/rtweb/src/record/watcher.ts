import type { WatcherArgs, RecordData } from '../types';
import { RecordType } from '../constants';
import { debounce, throttle, getTime } from '../utils';
import { RecorderModule } from '.';

type WatcherInstallOptions = WatcherArgs<Map<string, Watcher>, RecorderModule>;

export class Watcher {
  recorder!: RecorderModule;
  context!: Window;
  private emit!: (e: RecordData) => void;
  installOptions!: WatcherInstallOptions;
  options: any;

  constructor(options?: any) {
    this.options = options;
  }

  protected init(): void {}

  public install(options: WatcherInstallOptions) {
    const { emit, context, recorder } = options;
    this.installOptions = options;
    this.recorder = recorder;
    this.context = context;
    this.emit = emit;
    this.init();
  }

  public uninstall(fn: Function) {
    this.installOptions.listenStore.add(fn);
  }

  public emitData<T extends RecordType>(
    type: T,
    record?: RecordData<T>['data'], // data to save in db
    dom?: RecordData['dom'],
    eventWithTime?: RecordData['eventWithTime'], // origin data from rrweb
    time = getTime(),
    callback?: (data: RecordData) => RecordData
  ) {
    const data: RecordData<T> = {
      type,
      time,
      data: record,
      dom,
      eventWithTime,
    };

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
