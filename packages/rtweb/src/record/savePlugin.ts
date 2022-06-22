import { RecorderModule } from '.';
import localforage from 'localforage';
import { RECORD_TABLE } from '../constant';
import { RecordDbData, RecordData } from '../types';
type OPTIONS = {
  dbName: string;
  remoteUrl?: string;
};

export class SavePlugin {
  private records: RecordDbData[] = [];
  private store;
  private remoteUrl: string;

  constructor(options: OPTIONS) {
    /** init plugin options */
    if (!options.remoteUrl) {
      this.store = localforage.createInstance({
        name: options.dbName,
      });
    }
  }

  apply(recorder: RecorderModule) {
    const { plugin } = recorder;
    const id = 1;
    plugin('emit', (record: RecordData) => {
      //console.log(`received record:`, record);
      this.records.push({ type: record.type, time: record.time, ...record.extras });
    });

    plugin('end', () => {
      console.log('recording finish');
      const info = {
        id,
        url: window.location.href,
        w: window.innerWidth,
        h: window.innerHeight,
      };
      if (!this.remoteUrl) {
        this.store?.setItem(`id_${id}`, info).then(() => {
          this.records = [];
        });
        this.store?.setItem(`${RECORD_TABLE}_${id}`, this.records).then(() => {
          this.records = [];
        });
      } else {
        fetch(`${this.remoteUrl}/save_record`, {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ frames: this.records, ...info }),
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
