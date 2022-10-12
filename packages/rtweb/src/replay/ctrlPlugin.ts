import { PlayerModule } from '.';
import { RecordDbData, RecordType, PlayerEventTypes } from '../types';
import { observer } from '../utils';
import domtoimage from 'dom-to-image';

export class CtrlPlugin {
  constructor() {}

  apply(rePlayer: PlayerModule) {
    const { plugin } = rePlayer;

    plugin('render', (_, record: RecordDbData) => {
      console.log(`outer record:`, { ...record, type: record.type, time: record.time });
      // this.records.push({ type: record.type, time: record.time });
      if (record.type === RecordType.CAPTURE) {
        if (window.rtScreenshot) {
          window.rtScreenshot({ id: record.data?.id || 1 });
        } else {
          domtoimage.toJpeg(document.body, { quality: 0.95 }).then(function (dataUrl: any) {
            const link = document.createElement('a');
            link.download = `capture_${record.data?.id || 1}.jpeg`;
            link.href = dataUrl;
            link.click();
          });
        }
      }
    });

    observer.on(PlayerEventTypes.STOP, () => {
      if (window.rtFinishReplay) {
        window.rtFinishReplay();
      }
    });
  }
}
