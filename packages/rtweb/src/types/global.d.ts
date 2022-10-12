import { RecordDbData, ReplayData } from '.';
declare global {
  interface Window {
    G_RECORD_OPTIONS: any;
    G_REPLAY_RECORDS: RecordDbData[];
    G_REPLAY_STR_RECORDS: string;
    G_REPLAY_DATA: ReplayData;
    Object: typeof Object;

    HTMLElement: typeof HTMLElement;
    HTMLInputElement: typeof HTMLInputElement;
    HTMLSelectElement: typeof HTMLSelectElement;
    HTMLTextAreaElement: typeof HTMLTextAreaElement;
    HTMLOptionElement: typeof HTMLOptionElement;

    webkitAudioContext?: typeof AudioContext;

    rtScreenshot: (info: any) => Promise<any>;

    rtFinishReplay: Function;

    rtFetchRecords: Function;
  }

  interface Document {
    createElement(tagName: string, xx: boolean): HTMLElement;
  }

  interface EventTarget {
    result?: any;
  }

  interface Event {
    arguments: any;
  }

  interface HTMLInputElement {
    oldValue: string;
    value: string;
  }

  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
}

export {};
