import { RecordData } from '.';
declare global {
  interface Window {
    // TODO 重命名
    G_RECORD_OPTIONS: any;
    G_REPLAY_RECORDS: RecordData[];

    rtScreenshot: (info: any) => Promise<any>;

    rtFinishReplay: Function;

    rtFetchRecords: Function;
  }

  interface HTMLInputElement {
    oldValue: string;
    value: string;
  }
}

export {};
