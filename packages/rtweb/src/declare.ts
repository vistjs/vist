import { RecordData } from './types'

declare global {
    interface Window {
        G_RECORD_OPTIONS: any
        G_RECORD_RELATED_ID: string
        G_REPLAY_RECORDS: RecordData[]
        G_REPLAY_STR_RECORDS: string
        Object: typeof Object

        HTMLElement: typeof HTMLElement
        HTMLInputElement: typeof HTMLInputElement
        HTMLSelectElement: typeof HTMLSelectElement
        HTMLTextAreaElement: typeof HTMLTextAreaElement
        HTMLOptionElement: typeof HTMLOptionElement

        webkitAudioContext?: typeof AudioContext
    }

    interface Document {
        createElement(tagName: string, xx: boolean): HTMLElement
    }

    interface EventTarget {
        result?: any
    }

    interface Event {
        arguments: any
    }

    interface HTMLInputElement {
        oldValue: string
        value: string
    }

    interface HTMLCanvasElement {
        captureStream(frameRate?: number): MediaStream
    }
}

export {}