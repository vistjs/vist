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
  private records: RecordData[] = [];
  private store;
  private remoteUrl: string | undefined;
  private pid: number | undefined;

  constructor(options: OPTIONS) {
    /** init plugin options */
    if (!options.remoteUrl) {
      this.store = localforage.createInstance({
        name: options.dbName,
      });
    } else {
      this.remoteUrl = options.remoteUrl;
      this.pid = options.pid;
    }
  }

  apply(recorder: RecorderModule) {
    const { plugin } = recorder;
    // omit eventWithTime
    plugin('emit', ({ eventWithTime, ...record }: RecordData) => {
      //console.log(`received record:`, record);
      this.records.push(record);
    });

    plugin('end', () => {
      console.log('recording finish');
      const info = {
        url: window.location.href,
        w: window.innerWidth,
        h: window.innerHeight,
      };
      if (!this.remoteUrl) {
        this.store?.setItem(`id_1`, info).then(() => {
          this.records = [];
        });
        this.store?.setItem(`${RECORD_TABLE}_1`, this.records).then(() => {
          this.records = [];
        });
      } else {
        setTimeout(() => {
          const mocks = localStorage.getItem(POLLY_DB_NAME);
          fetch(`${this.remoteUrl}/api/open/case`, {
            method: 'POST', // or 'PUT'
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({ steps: this.records, mocks, ...info, pid: this.pid }),
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
