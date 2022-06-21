import { RecorderModule } from '.';
import hotkeys from 'hotkeys-js';
import { Watcher } from './watcher';
import { RECORD_TABLE } from '../constant';
import { RecordDbData, RecordData } from '../types';

type OPTIONS = {
  stopKey?: string;
  captureKey?: string;
};

class HotKeysWatcher extends Watcher<any> {
  init() {
    hotkeys([this.watchOptions.stopKey, this.watchOptions.captureKey].join(','), (event, handler) => {
      if (handler.key === this.watchOptions.stopKey) {
        console.log('want to stop');
      }
      if (handler.key === this.watchOptions.captureKey) {
        console.log('want to capture');
      }
      event.preventDefault();
      return false;
    });
  }
}

const defaultStopKey = 'ctrl+s';
const defaultCaptureKey = 'ctrl+c';

export class ctrlPlugin {
  private stopKey: string;
  private captureKey: string;

  constructor(options: OPTIONS) {
    /** init plugin options */
    this.stopKey = options.stopKey || defaultStopKey;
    this.captureKey = options.captureKey || defaultCaptureKey;
  }

  apply(recorder: RecorderModule) {
    const { plugin, addWatcher } = recorder;

    addWatcher(
      new HotKeysWatcher({
        stopKey: this.stopKey,
        captureKey: this.captureKey,
      })
    );
  }
}
