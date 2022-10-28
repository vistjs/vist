import { SyncHook } from 'tapable';

import type { RecordOptions } from '../types';
import { logError } from '../utils';
import { Watcher } from './watcher';
import { CtrlPlugin } from './ctrlPlugin';
export interface RecorderPlugin {
  apply(recorder: Pluginable): void;
}

type HooksType = 'beforeRun' | 'run' | 'emit' | 'end';

type IHOOK = Record<HooksType, SyncHook<any, any, any>>;

// record`s plugin use to extend emit record
export class Pluginable {
  protected hooks: IHOOK;
  protected defaultPlugins: RecorderPlugin[] = [];
  public pluginWatchers: Watcher[] = [];

  constructor(options?: RecordOptions) {
    this.defaultPlugins.push(
      new CtrlPlugin({
        stopKey: options?.hotkeys?.stop,
        captureKey: options?.hotkeys?.capture,
      })
    );

    this.initPlugin(options);

    const DEFAULT_HOOKS = {
      beforeRun: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(['data']),
      end: new SyncHook(),
    };

    const HOOKS = this.checkHookAvailable()
      ? DEFAULT_HOOKS
      : Object.keys(DEFAULT_HOOKS).reduce((obj, key) => {
          return { ...obj, [key]: () => {} };
        }, {} as { [key in keyof typeof DEFAULT_HOOKS]: any });

    this.hooks = HOOKS;
  }

  public checkHookAvailable = () => {
    try {
      new SyncHook().call(null);
      return true;
    } catch (error) {
      logError(`Plugin hooks is not available in the current env, because ${error}`);
      return false;
    }
  };

  public plugin = (type: keyof IHOOK, cb: (data: any) => void) => {
    //const name = this.hooks[type].constructor.name;
    //const method = /Async/.test(name) ? 'tapAsync' : 'tap';
    this.hooks[type].tap(type, cb);
  };

  public use(plugin: RecorderPlugin): void {
    this.plugins.push(plugin);
  }

  private initPlugin(options?: RecordOptions) {
    const { plugins } = options || {};
    this.plugins.push(...this.defaultPlugins, ...(plugins || []));
  }

  protected loadPlugins() {
    this.plugins.forEach((plugin) => {
      plugin.apply.call(plugin, this);
    });
  }

  private plugins: RecorderPlugin[] = [];

  public addWatcher = (watcher: Watcher) => {
    this.pluginWatchers.push(watcher);
  };
}
