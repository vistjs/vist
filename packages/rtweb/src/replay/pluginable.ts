import { SyncBailHook } from 'tapable';
import type { ReplayOptions } from '../types';
import { logError } from '../utils';
import { Store } from './stores';
import { CtrlPlugin } from './ctrlPlugin';
import { PlayerComponent } from './player';

export interface ReplayerPlugin {
  apply(rePlayer: Pluginable): void;
}

type HooksType = 'render';

type IHOOK = Record<HooksType, SyncBailHook<string[], unknown, unknown>>;

// replay`s plugin to extend ctrl replay 和render
export class Pluginable {
  public hooks: IHOOK;
  private defaultPlugins: ReplayerPlugin[] = [];
  public player!: PlayerComponent;

  constructor(options?: ReplayOptions) {
    this.defaultPlugins.push(new CtrlPlugin());

    this.initPlugin(options);

    const DEFAULT_HOOKS = {
      render: new SyncBailHook<string[], unknown, unknown>(['player', 'record', 'options']),
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
      new SyncBailHook().call(null);
      return true;
    } catch (error) {
      logError(`Plugin hooks is not available in the current env, because ${error}`);
      return false;
    }
  };

  // register hook callback
  public plugin = (type: keyof IHOOK, cb: (player: any, record: any, options: any) => void) => {
    //const name = this.hooks[type].constructor.name;
    // const method = /Async/.test(name) ? 'tapAsync' : 'tap';
    this.hooks[type].tap(type, cb);
  };

  public play() {
    if (Store.playerStore.speed === 0) {
      Store.playerStore.setSpeed(1);
    } else {
      this.player.play();
    }
  }

  public speed(n: number) {
    Store.playerStore.setSpeed(n);
  }

  public pause() {
    this.player.pause();
  }

  public stop() {
    this.player.stop();
  }

  public use(plugin: ReplayerPlugin): void {
    this.plugins.push(plugin);
  }

  private initPlugin(options?: ReplayOptions) {
    const { plugins } = options || {};
    this.plugins.push(...this.defaultPlugins, ...(plugins || []));
  }

  protected loadPlugins() {
    this.plugins.forEach((plugin) => {
      // apply is the plugin init call，this is Pluginable subclass instance
      plugin.apply.call(plugin, this);
    });
  }

  private plugins: ReplayerPlugin[] = [];
}
