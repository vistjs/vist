import { PlayerModule } from '.';
import { RecordType } from '../constants';
import type { RecordData } from '../types';
import domtoimage from 'dom-to-image';

export class CtrlPlugin {
  constructor() {}

  apply(rePlayer: PlayerModule) {
    const { plugin } = rePlayer;

    plugin('render', (_, record: RecordData<RecordType.CAPTURE>) => {
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

    plugin('stop', () => {
      if (window.rtFinishReplay) {
        window.rtFinishReplay();
      }
    });
  }
}
