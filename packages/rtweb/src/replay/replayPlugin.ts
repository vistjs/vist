import { PlayerModule } from '.';
import { RecordDbData, RecordType } from '../types';
import domtoimage from 'dom-to-image';

export class ReplayPlugin {
  constructor() {}

  apply(rePlayer: PlayerModule) {
    const { plugin } = rePlayer;

    plugin('render', (_, record: RecordDbData) => {
      console.log(`outer record:`, { ...record, type: record.type, time: record.time });
      // this.records.push({ type: record.type, time: record.time });
      if (record.type === RecordType.CAPTURE) {
        domtoimage.toJpeg(document.body, { quality: 0.95 }).then(function (dataUrl: any) {
          var link = document.createElement('a');
          link.download = `capture_${record.data?.id || 1}.jpeg`;
          link.href = dataUrl;
          link.click();
        });
      }
    });
  }
}
