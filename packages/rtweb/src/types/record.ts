import { RecorderPlugin }  from '../plugin/recordPluginable'
import { RecorderModule } from '../record'
import { watchers } from '../record/watchers'

interface RecordOptionsBase {
    context?: Window
    rootContext?: Window
    rootRecorder?: RecorderModule
    disableWatchers?: Array<keyof typeof watchers>
}

export interface RecordOptions extends RecordOptionsBase {
    plugins?: RecorderPlugin[]
}

export interface RecordInternalOptions extends Required<RecordOptions> {
    context: Window
}

export type WatcherArgs<T extends RecordData, WatchersInstance = any, Recorder = any> = {
    recorder: Recorder
    context: Window
    listenStore: Set<Function>
    emit: RecordEvent<T>
    watchers: WatchersInstance
}

export type RecordEvent<T extends RecordData> = (e: T) => void

export type RecordData = any

export enum RecordType {
    'HEAD',
    'SNAPSHOT',
    'WINDOW',
    'SCROLL',
    'MOUSE',
    'DOM',
    'FORM_EL',
    'LOCATION',
    'AUDIO',
    'CANVAS',
    'TERMINATE',
    'FONT',
    'PATCH',
    'CUSTOM',
    'WEBGL',
    'CANVAS_SNAPSHOT',
    'VIDEO'
}

export enum RecorderStatus {
    RUNNING = 'running',
    PAUSE = 'pause',
    HALT = 'halt'
}

export type RecorderMiddleware = (data: RecordData, n: () => Promise<void>) => Promise<void>
