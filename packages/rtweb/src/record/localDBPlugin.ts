import { RecorderModule } from '.';
import localforage from 'localforage';
import { RECORD_TABLE } from '../constant';
import { RecordDbData, RecordData } from '../types';
type OPTIONS = {
  dbName: string;
};

export class localDBPlugin {
  private dbName: string;
  private records: RecordDbData[] = [];
  private store;

  constructor(options: OPTIONS) {
    /** init plugin options */
    this.dbName = options.dbName;
    this.store = localforage.createInstance({
      name: this.dbName,
    });
  }

  apply(recorder: RecorderModule) {
    const { plugin } = recorder;

    plugin('emit', (record: RecordData) => {
      // console.log(`received record:`, record);
      this.records.push({ type: record.type, time: record.time, ...record.extras });
    });

    plugin('end', () => {
      console.log('recording finish');
      this.store.setItem(RECORD_TABLE, this.records).then(() => {
        this.records = [];
      });
    });
  }
}
