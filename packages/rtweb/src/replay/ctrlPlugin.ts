import { PlayerModule } from '.';
import { RECORD_TABLE } from '../constant';
import { RecordDbData, RecordData } from '../types';

export class ctrlPlugin {
  private dbName: string;
  private records: RecordDbData[] = [];

  constructor() {}

  apply(replayer: PlayerModule) {
    const { plugin } = replayer;

    plugin('render', (_, record: RecordDbData) => {
      console.log(`outer record:`, record);
      this.records.push({ type: record.type, time: record.time, ...record.extras });
    });

    setTimeout(() => {
      replayer.pause();
    }, 10000);
  }
}
