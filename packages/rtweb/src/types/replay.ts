import {RecordDbData} from './record'

export interface ReplayData {
    index?: number
    records: RecordDbData[]
}

export interface ReplayOptions {
    exportName?: string
    receiver?: (sender: (data: RecordDbData[]) => void) => void
    autoplay?: boolean
    records?: RecordDbData[]
    target?: string | HTMLElement | Window
}

export interface ReplayInternalOptions extends ReplayOptions {
    destroyStore: Set<Function>
    autoplay: boolean
    target: string | HTMLElement | Window
}

export enum PlayerEventTypes {
    INIT = 'init',
    PLAY = 'play',
    PAUSE = 'pause',
    STOP = 'stop',
    SPEED = 'speed',
    RESIZE = 'resize',
    PROGRESS = 'progress',
    JUMP = 'jump'
}