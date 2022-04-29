// player裸壳子，要提供命令出来

import { logError, logInfo, isDev, removeGlobalVariables, delay, tempEmptyFn, FMP, observer } from '../utils';

import { ReplayOptions, RecordDbData, ReplayInternalOptions, PlayerEventTypes } from '../types';
import { PlayerComponent } from './player';
import { Pluginable } from './pluginable';

import { Store } from './stores';
import { reaction } from 'mobx';

const defaultReplayOptions = {
  autoplay: true,
  target: window,
};

export class Player {
  on: (key: PlayerEventTypes, fn: Function) => void = tempEmptyFn;
  destroy: () => void = tempEmptyFn;
  constructor(options?: ReplayOptions) {
    const player = new PlayerModule(options);
    Object.keys(this).forEach((key: keyof Player) => {
      this[key] = player[key].bind(player);
    });
  }
}

export class PlayerModule extends Pluginable {
  private fmp: FMP;
  destroyStore = new Set<Function>();
  private options: ReplayInternalOptions;
  private initialized = false;
  private player: PlayerComponent;

  constructor(options?: ReplayOptions) {
    super(options);
    this.initOptions(options);
    this.init();
  }

  private watchData(records: RecordDbData[]) {
    if (records && !this.initialized) {
      this.initialized = true;
      const opts = this.options;
      (this.fmp = new FMP()).ready(async () => {
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

    // warning: 让plugin的hook先于player注册
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
    } as ReplayInternalOptions;

    this.options = opts;
    Store.playerStore.setOptions(opts);
  }

  private async initData() {
    const opts = this.options;
    const records = await this.getRecords(opts);
    window.G_REPLAY_RECORDS = records;
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
    const startTime = records[0].time;
    const endTime = records.slice(-1)[0].time;
    const duration = endTime - startTime;
    Store.progressStore.setProgress({ startTime, endTime, duration });
  }

  private async dataReceiver(receiver: (sender: (data: RecordDbData[]) => void) => void): Promise<RecordDbData[]> {
    return await new Promise((resolve) => {
      receiver((data) => {
        resolve(data);
      });
    });
  }

  async destroy(opts: { removeDOM: boolean } = { removeDOM: true }) {
    this.destroyStore.forEach((un) => un());
    observer.destroy();
    await delay(0);
    removeGlobalVariables();
  }

  public on(key: PlayerEventTypes, fn: Function) {
    observer.on(key, fn);
  }
}
