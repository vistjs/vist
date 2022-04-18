import {
	SyncHook,
 } from 'tapable'

import { RecordOptions } from '../types'
import { logError } from '../utils'
import { Watcher } from './watcher'

export interface RecorderPlugin {
    apply(recorder: Pluginable): void
}

type HooksType = 'beforeRun' | 'run' | 'emit' | 'end'

type IHOOK = Record<HooksType, SyncHook<any, any, any>>


// 继承Pluginable后，在constructor要调用loadPlugins，通过 this.hooks.xx.call触发plugin
export class Pluginable {
    protected hooks: IHOOK
    private defaultPlugins: RecorderPlugin[] = [] // todo
    public pluginWatchers: typeof Watcher[] = []

    constructor(options?: RecordOptions) {
        this.initPlugin(options)

        const DEFAULT_HOOKS = {
            beforeRun: new SyncHook(),
            run: new SyncHook(),
            emit: new SyncHook(['data']),
            end: new SyncHook()
        }

        const HOOKS = this.checkHookAvailable()
            ? DEFAULT_HOOKS
            : Object.keys(DEFAULT_HOOKS).reduce((obj, key) => {
                  return { ...obj, [key]: () => {} }
              }, {} as { [key in keyof typeof DEFAULT_HOOKS]: any })

        this.hooks = HOOKS
    }

    public checkHookAvailable = () => {
        try {
            new SyncHook().call(null)
            return true
        } catch (error) {
            logError(`Plugin hooks is not available in the current env, because ${error}`)
        }
    }

    // 让插件注册hook回调
    public plugin = (type: keyof IHOOK, cb: (data: any) => void) => {
        const name = this.hooks[type].constructor.name
        const method = /Async/.test(name) ? 'tapAsync' : 'tap'
        // @ts-ignore
        this.hooks[type][method](type, cb)
    }

    public use(plugin: RecorderPlugin): void {
        this.plugins.push(plugin)
    }

    private initPlugin(options?: RecordOptions) {
        const { plugins } = options || {}
        this.plugins.push(...this.defaultPlugins, ...(plugins || []))
    }

    protected loadPlugins() {
        this.plugins.forEach(plugin => {
            // 插件的apply方法为初始化方法，this为Pluginable
            plugin.apply.call(plugin, this)
        })
    }

    private plugins: RecorderPlugin[] = []

    public addWatcher(watcher: typeof Watcher) {
        this.pluginWatchers.push(watcher)
    }
}
