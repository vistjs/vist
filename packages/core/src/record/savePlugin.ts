import { RecorderModule } from '.';
import { RecorderPlugin } from './pluginable';
import localforage from 'localforage';
import { RECORD_TABLE, POLLY_DB_NAME } from '../constants';
import type { RecordData } from '../types';
type OPTIONS = {
  dbName: string;
  remoteUrl?: string;
  pid?: number; // project id
};

export class SavePlugin implements RecorderPlugin {
  private recordUrl: string;
  private records: RecordData[] = [];
  private store;
  private remoteUrl: string | undefined;
  private pid: number | undefined;

  constructor(options: OPTIONS) {
    /** init plugin options */
    this.store = localforage.createInstance({
      name: options.dbName,
    });
    if (options.remoteUrl) {
      this.remoteUrl = options.remoteUrl;
      this.pid = options.pid;
    }
    this.recordUrl = window.location.href;
  }

  apply(recorder: RecorderModule) {
    const { plugin } = recorder;
    // omit eventWithTime
    plugin('emit', ({ eventWithTime, ...record }: RecordData) => {
      //console.log(`received record:`, record);
      this.records.push(record);
    });

    plugin('stop', () => {
      console.log('recording finish');
      const info = {
        url: this.recordUrl,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      this.store
        ?.setItem(`${RECORD_TABLE}_1`, { steps: this.records, ...info, pid: this.pid })
        .then(() => {
          if (!this.remoteUrl) {
            this.records = [];
          }
        })
        .catch((e) => {
          console.log('e', e);
        });
      if (this.remoteUrl) {
        const name = window.prompt('please input case name');
        setTimeout(() => {
          const mocks = localStorage.getItem(POLLY_DB_NAME);
          fetch(`${this.remoteUrl}/api/open/case`, {
            method: 'POST', // or 'PUT'
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({ steps: this.records, mocks, ...info, pid: this.pid, name }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Success:', data);
              this.records = [];
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }, 200);
      }
    });
  }
}
