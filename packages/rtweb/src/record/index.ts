
 import { watchers, baseWatchers } from './watchers'
 import { logError, getTime, tempEmptyFn, tempEmptyPromise, delay } from '../utils'
 import { Pluginable } from './pluginable';
 import { Watcher } from './watcher'
 import { RecordData, RecorderMiddleware, RecorderStatus, RecordInternalOptions, RecordOptions } from '../types'
 
 export class Recorder {
     public startTime: number
     public destroyTime: number
     public status: RecorderStatus = RecorderStatus.PAUSE
     public onData: RecorderModule['onData'] = tempEmptyFn
     public destroy: RecorderModule['destroy'] = tempEmptyPromise
     public pause: RecorderModule['pause'] = tempEmptyPromise as RecorderModule['pause']
     public record: RecorderModule['record'] = tempEmptyPromise as RecorderModule['record']
     public use: RecorderModule['use'] = tempEmptyFn
     constructor(options?: RecordOptions) {
         const recorder = new RecorderModule(options)
         Object.keys(this).forEach((key: keyof Recorder) => {
             Object.defineProperty(this, key, {
                 get() {
                     return typeof recorder[key] === 'function'
                         ? (recorder[key] as Function).bind(recorder)
                         : recorder[key]
                 }
             })
         })
     }
 }
 
 export class RecorderModule extends Pluginable {
     private static defaultRecordOpts = {
         mode: 'default',
         write: true,
         keep: false,
         audio: false,
         video: false,
         emitLocationImmediate: true,
         context: window,
         rewriteResource: [],
         disableWatchers: []
     } as RecordOptions
     private defaultMiddleware: RecorderMiddleware[] = []
     private listenStore: Set<Function> = new Set()
     private middleware: RecorderMiddleware[] = [...this.defaultMiddleware]
     private watchers: Array<typeof Watcher>
     private watchersInstance = new Map<string, Watcher<RecordData>>()
     private watchesReadyPromise = new Promise(resolve => (this.watcherResolve = resolve))
     private watcherResolve: Function
     private startTime: number
     private destroyTime: number
 
     public status: RecorderStatus = RecorderStatus.PAUSE
     public options: RecordInternalOptions
 
     constructor(options?: RecordOptions) {
         super(options)
         const opts = this.initOptions(options)
         this.options = opts
         this.watchers = this.getWatchers() as typeof Watcher[]
         this.init()
     }
 
     private initOptions(options?: RecordOptions) {
         const opts = { ...RecorderModule.defaultRecordOpts, ...options } as RecordInternalOptions
         return opts
     }
 
     private init() {
         this.startTime = getTime()
         const options = this.options
         this.loadPlugins()
         this.hooks.beforeRun.call(this)
         this.record(options)
         this.hooks.run.call(this)
     }
 
     public onData(fn: (data: RecordData, next: () => Promise<void>) => Promise<void>) {
         this.middleware.unshift(fn)
     }
 
     public async destroy() {
         if (this.status === RecorderStatus.HALT) {
             return
         }
         const ret = await this.pause()
         if (ret) {
             this.status = RecorderStatus.HALT
             this.destroyTime = ret.lastTime || getTime()
         }
     }
 
     private async pause() {
         if (this.status === RecorderStatus.RUNNING) {
             this.status = RecorderStatus.PAUSE
 
             await this.cancelListener()
            
 
             let lastTime: number | null = null
             return { lastTime }
         }
     }

 
     private async cancelListener() {
         // wait for watchers loaded
         await this.watchesReadyPromise
         this.listenStore.forEach(un => un())
         this.listenStore.clear()
     }
 
     private getWatchers() {
         const { disableWatchers } = this.options
         const watchersList = [...Object.values(watchers)] as typeof Watcher[]
 
         return watchersList.filter(watcher => {
             return !~disableWatchers.indexOf(watcher.name as keyof typeof watchers)
         })
     }
 
     private record(options: RecordOptions | RecordInternalOptions): void {
         if (this.status === RecorderStatus.PAUSE) {
             const opts = { ...RecorderModule.defaultRecordOpts, ...options } as RecordInternalOptions
             this.startRecord((opts.context.G_RECORD_OPTIONS = opts))
             return
         }
     }
 
     private async startRecord(options: RecordInternalOptions) {
         this.status = RecorderStatus.RUNNING
         let activeWatchers = [...this.watchers, ...this.pluginWatchers]
 
         activeWatchers = [...Object.values(baseWatchers)] as typeof Watcher[]

         const onEmit = (options: RecordOptions) => {
             const emitTasks: Array<RecordData> = []
             const { middleware: rootMiddleware } = this.options.rootRecorder || { middleware: [] }
             const execTasksChain = (() => {
                 let concurrency = 0
                 const MAX_CONCURRENCY = 1
                 return async () => {
                     if (concurrency >= MAX_CONCURRENCY) {
                         return
                     }
                     concurrency++
                     while (emitTasks.length) {
                         const record = emitTasks.shift()!
                         await delay(0)
                         if (this.status === RecorderStatus.RUNNING) {
                             const middleware = [...rootMiddleware, ...this.middleware]
                             await this.connectCompose(middleware)(record)
                             this.hooks.emit.call(record)
                         }
                     }
                     concurrency--
                 }
             })()
 
             return (data: RecordData) => {
                 if (!data) {
                     return
                 }
 
                 emitTasks.push(data)
                 execTasksChain()
             }
         }
 
         const emit = onEmit(options)
 
 
         activeWatchers.forEach(Watcher => {
             try {
                 const watcher = new Watcher({
                     recorder: this,
                     context: options && options.context,
                     listenStore: this.listenStore,
                     emit,
                     watchers: this.watchersInstance
                 })
                 this.watchersInstance.set(Watcher.name, watcher)
             } catch (e) {
                 logError(e)
             }
         })
 
 
         this.watcherResolve()
     }
 
 
     private connectCompose(list: RecorderMiddleware[]) {
         return async (data: RecordData) => {
             return await list.reduce(
                 (next: () => Promise<void>, fn: RecorderMiddleware) => {
                     return this.createNext(fn, data, next)
                 },
                 () => Promise.resolve()
             )()
         }
     }
 
     private createNext(fn: RecorderMiddleware, data: RecordData, next: () => Promise<void>) {
         return async () => await fn(data, next)
     }
 }
 