import { watchers } from './watchers';
import { logError, getTime, tempEmptyFn, tempEmptyPromise, delay, observer } from '../utils';
import { Pluginable } from './pluginable';
import { Watcher } from './watcher';
import type { RecordData, RecorderMiddleware, RecordInternalOptions, RecordOptions } from '../types';
import { RecorderEventTypes } from '../constants';
export class Recorder {
  on: (key: RecorderEventTypes, fn: Function) => void = tempEmptyFn;
  public startTime!: number;
  public destroyTime!: number;
  public status: RecorderEventTypes = RecorderEventTypes.INIT;
  public onData: RecorderModule['onData'] = tempEmptyFn; // to transfer recordData in middleware
  public stop: RecorderModule['stop'] = tempEmptyPromise;
  public pause: RecorderModule['pause'] = tempEmptyPromise as RecorderModule['pause'];
  public record: RecorderModule['record'] = tempEmptyPromise as RecorderModule['record'];
  public use: RecorderModule['use'] = tempEmptyFn;
  [key: string]: any;
  constructor(options: RecordOptions) {
    const recorder = new RecorderModule(options);
    Object.keys(this).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return typeof recorder[key] === 'function' ? (recorder[key] as Function).bind(recorder) : recorder[key];
        },
      });
    });
  }
}

export class RecorderModule extends Pluginable {
  private static defaultRecordOpts = {
    context: window,
    disableWatchers: [],
  };
  private defaultMiddleware: RecorderMiddleware[] = [];
  private listenStore: Set<Function> = new Set();
  public middleware: RecorderMiddleware[] = [...this.defaultMiddleware];
  private watchers: Array<Watcher>;
  private watchersInstance = new Map<string, Watcher>();
  private watchesReadyPromise;
  private watcherResolve!: Function;
  private startTime!: number;
  private destroyTime!: number;
  public status: RecorderEventTypes = RecorderEventTypes.INIT;
  public options!: RecordInternalOptions;

  [key: string]: any;
  constructor(options: RecordOptions) {
    super(options);
    this.options = { ...RecorderModule.defaultRecordOpts, ...options };
    this.watchers = this.getWatchers();
    this.watchesReadyPromise = new Promise((resolve) => (this.watcherResolve = resolve));
    this.init();
  }

  private init() {
    this.startTime = getTime();
    this.loadPlugins();
    this.hooks.beforeRun.call(this);
    this.record(this.options);
    observer.emit(RecorderEventTypes.RECORD);
    this.hooks.run.call(this);
  }

  public onData(fn: (data: RecordData, next: () => Promise<void>) => Promise<void>) {
    this.middleware.unshift(fn);
  }

  public async stop() {
    if (this.status === RecorderEventTypes.STOP) {
      return;
    }
    const ret = await this.pause();
    if (ret) {
      this.status = RecorderEventTypes.STOP;
      this.destroyTime = ret.lastTime || getTime();
    }
    observer.emit(RecorderEventTypes.STOP);
    this.hooks.end.call(this);
  }

  private async pause() {
    if (this.status === RecorderEventTypes.RECORD) {
      this.status = RecorderEventTypes.PAUSE;

      await this.cancelListener();

      const lastTime: number | null = null;
      return { lastTime };
    }
  }

  private async cancelListener() {
    // wait for watchers loaded
    await this.watchesReadyPromise;
    this.listenStore.forEach((un) => un());
    this.listenStore.clear();
  }

  private getWatchers() {
    const { disableWatchers } = this.options;
    const watchersList = [...Object.values(watchers)];

    return watchersList.filter((watcher) => {
      return !~disableWatchers.indexOf(watcher.constructor.name as keyof typeof watchers);
    });
  }

  private record(options: RecordInternalOptions): void {
    if (this.status === RecorderEventTypes.INIT) {
      this.startRecord((options.context.G_RECORD_OPTIONS = options));
      return;
    }
  }

  private async startRecord(options: RecordInternalOptions) {
    this.status = RecorderEventTypes.RECORD;
    const activeWatchers = [...this.watchers, ...this.pluginWatchers];

    const onEmit = (options: RecordInternalOptions) => {
      const emitTasks: Array<RecordData> = [];
      const { middleware: rootMiddleware } = options.rootRecorder || { middleware: [] };
      const execTasksChain = (() => {
        let concurrency = 0;
        const MAX_CONCURRENCY = 1;
        return async () => {
          if (concurrency >= MAX_CONCURRENCY) {
            return;
          }
          concurrency++;
          while (emitTasks.length) {
            const record = emitTasks.shift()!;
            await delay(0);
            if (this.status === RecorderEventTypes.RECORD) {
              const middleware = [...rootMiddleware, ...this.middleware];
              await this.connectCompose(middleware)(record);
              this.hooks.emit.call(record);
            }
          }
          concurrency--;
        };
      })();

      return (data: RecordData) => {
        if (!data) {
          return;
        }

        emitTasks.push(data);
        execTasksChain();
      };
    };

    const emit = onEmit(options);

    activeWatchers.forEach((watcher) => {
      try {
        watcher.install({
          recorder: this,
          context: options.context,
          listenStore: this.listenStore,
          emit,
          watchers: this.watchersInstance,
        });
        this.watchersInstance.set(watcher.constructor.name, watcher);
      } catch (e: any) {
        logError(e);
      }
    });

    this.watcherResolve?.();
  }

  private connectCompose(list: RecorderMiddleware[]) {
    return async (data: RecordData) => {
      return await list.reduce(
        (next: () => Promise<void>, fn: RecorderMiddleware) => {
          return this.createNext(fn, data, next);
        },
        () => Promise.resolve()
      )();
    };
  }

  private createNext(fn: RecorderMiddleware, data: RecordData, next: () => Promise<void>) {
    return async () => await fn(data, next);
  }

  public on(key: RecorderEventTypes, fn: Function) {
    observer.on(key, fn);
  }
}
