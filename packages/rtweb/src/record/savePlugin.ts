import { RecorderModule } from '.';
import localforage from 'localforage';
import { RECORD_TABLE } from '../constant';
import { RecordDbData, RecordData } from '../types';
type OPTIONS = {
  dbName: string;
  remoteUrl?: string;
  pid?: number; // project id
};

export class SavePlugin {
  private records: RecordDbData[] = [];
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
    plugin('emit', (record: RecordData) => {
      //console.log(`received record:`, record);
      this.records.push({ type: record.type, time: record.time, ...record.extras });
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
        fetch(`${this.remoteUrl}/api/open/case`, {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ frames: this.records, apis: [], ...info, pid: this.pid }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Success:', data);
            this.records = [];
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    });
  }
}
