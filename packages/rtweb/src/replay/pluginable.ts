import { SyncBailHook } from 'tapable';
import { ReplayOptions } from '../types';
import { logError } from '../utils';
import { Store } from './stores';
import { ReplayPlugin } from './replayPlugin';
export interface ReplayerPlugin {
  apply(recorder: Pluginable): void;
}

type HooksType = 'render';

type IHOOK = Record<HooksType, SyncBailHook<any, any, any>>;

// replay`s plugin to extend ctrl replay 和render
export class Pluginable {
  public hooks: IHOOK;
  private defaultPlugins: ReplayerPlugin[] = [];

  constructor(options?: ReplayOptions) {
    this.defaultPlugins.push(new ReplayPlugin());

    this.initPlugin(options);

    const DEFAULT_HOOKS = {
      //@ts-ignore has player
      render: new SyncBailHook(['player', 'record', 'options']),
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
    }
  };

  // register hook callback
  public plugin = (type: keyof IHOOK, cb: (player: any, record: any, options: any) => void) => {
    const name = this.hooks[type].constructor.name;
    const method = /Async/.test(name) ? 'tapAsync' : 'tap';
    // @ts-ignore: TODO
    this.hooks[type][method](type, cb);
  };

  public play() {
    if (Store.playerStore.speed === 0) {
      Store.playerStore.setSpeed(1);
    } else {
      //@ts-ignore has player
      this.player.play();
    }
  }

  public speed(n: number) {
    Store.playerStore.setSpeed(n);
  }

  public pause() {
    //@ts-ignore has player
    this.player.pause();
  }

  public stop() {
    //@ts-ignore has player
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
