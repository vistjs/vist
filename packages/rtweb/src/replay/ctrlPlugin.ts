import { PlayerModule } from '.';
import { RECORD_TABLE } from '../constant';
import { RecordDbData, RecordData } from '../types';

export class ctrlPlugin {
  private dbName: string;
  private records: RecordDbData[] = [];

  constructor() {}

  apply(rePlayer: PlayerModule) {
    const { plugin } = rePlayer;

    // document.addEventListener(
    //   'mouseenter',
    //   () => {
    //     console.log('trigger mouseenter');
    //   },
    //   { capture: true }
    // );
    plugin('render', (_, record: RecordDbData) => {
      // console.log(`outer record:`, { ...record, type: record.type, time: record.time });
      // this.records.push({ type: record.type, time: record.time });
    });
  }
}
