import { logError, logInfo, isDev, removeGlobalVariables, delay, tempEmptyFn, FMP, observer } from '../utils';
import type { ReplayOptions, RecordData, ReplayInternalOptions } from '../types';
import { PlayerComponent } from './player';
import { Pluginable, HooksType } from './pluginable';
import { Store } from './stores';
import { reaction } from 'mobx';

const defaultReplayOptions = {
  autoplay: true,
  target: window,
  context: window,
};

export class Player {
  on: (key: HooksType, fn: (player?: any, record?: any, options?: any) => any) => void = tempEmptyFn;
  destroy: () => void = tempEmptyFn;
  [key: string]: any;
  constructor(options?: ReplayOptions) {
    const player = new PlayerModule(options);
    Object.keys(this).forEach((key) => {
      this[key] = player[key].bind(player);
    });
  }
}

export class PlayerModule extends Pluginable {
  destroyStore = new Set<Function>();
  private options!: ReplayInternalOptions;
  private initialized = false;
  [key: string]: any;
  constructor(options?: ReplayOptions) {
    super(options);
    this.initOptions(options);
    this.init();
  }

  private watchData(records: RecordData[]) {
    if (records && !this.initialized) {
      this.initialized = true;
      const opts = this.options;
      new FMP().ready(async () => {
        if (records.length) {
          if (opts.autoplay) {
            if (opts.autoplay) {
              Store.playerStore.setSpeed(1);
            }
          }
        }
      });
      this.calcProgress();
    }
  }

  private init() {
    if (!isDev) {
      logInfo();
    }

    // warning: let plugin`s hook before player component init
    this.loadPlugins();

    this.initComponent();
    this.listenStore();

    this.initData();
  }

  private initComponent() {
    this.player = new PlayerComponent(this.options, this);
  }

  private listenStore() {
    reaction(() => Store.replayDataStore.records, this.watchData.bind(this));
  }

  private async initOptions(options?: ReplayOptions) {
    const opts = {
      destroyStore: this.destroyStore,
      ...defaultReplayOptions,
      ...options,
    };

    this.options = opts;
    Store.playerStore.setOptions(opts);
  }

  private async initData() {
    const opts = this.options;
    const records = await this.getRecords(opts);
    opts.context.G_REPLAY_RECORDS = records;
    Store.replayDataStore.updateData({ records });
  }

  private async getRecords(options: ReplayInternalOptions) {
    const { receiver, records: recordsData } = options;

    const records = recordsData || (receiver && (await this.dataReceiver(receiver)));

    if (!records) {
      throw logError('Replay data not found');
    }

    console.log('getRecords', records);

    return records;
  }

  private calcProgress() {
    const { records } = Store.replayDataStore;
    if (!records || records.length === 0) return;
    const startTime = records[0]!.time;
    const endTime = records.slice(-1)[0]!.time;
    const duration = endTime - startTime;
    Store.progressStore.setProgress({ startTime, endTime, duration });
  }

  private async dataReceiver(receiver: (sender: (data: RecordData[]) => void) => void): Promise<RecordData[]> {
    return await new Promise((resolve) => {
      receiver((data) => {
        resolve(data);
      });
    });
  }

  async destroy() {
    this.destroyStore.forEach((un) => un());
    observer.destroy();
    await delay(0);
    removeGlobalVariables();
  }

  public on(key: HooksType, fn: (player?: any, record?: any, options?: any) => any) {
    this.plugin(key, fn);
  }
}
