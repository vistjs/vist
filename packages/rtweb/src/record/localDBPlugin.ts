import { RecorderModule } from '.';
import localforage from 'localforage';
import { RecordDbData, RecordData } from '../types';
type OPTIONS = {
  dbName: string;
};

export class localDBPlugin {
  private dbName: string;
  private records: RecordDbData[] = [];

  constructor(options: OPTIONS) {
    /** init plugin options */
    this.dbName = options.dbName;
  }

  apply(recorder: RecorderModule) {
    const { plugin } = recorder;
    plugin('run', (record) => {
      localforage.config({ name: this.dbName });
    });

    plugin('emit', (record: RecordData) => {
      console.log(`received record: ${record}`);
      this.records.push({ type: record.type, time: record.time, ...record.extras });
    });

    plugin('end', () => {
      console.log('recording finish');
      localforage.setItem('frames', this.records).then(() => {
        this.records = [];
      });
    });
  }
}
