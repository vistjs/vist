import { RecorderModule } from '.';
import { RecorderPlugin } from './pluginable';
import hotkeys from 'hotkeys-js';
import { Watcher } from './watcher';
import { RecordType } from '../constants';

type OPTIONS = {
  stopKey?: string;
  captureKey?: string;
};

class HotKeysWatcher extends Watcher {
  init() {
    const { recorder } = this.installOptions;
    let id = 1;
    hotkeys([this.options.stopKey, this.options.captureKey].join(','), (event, handler) => {
      if (handler.key === this.options.stopKey) {
        console.log('want to stop');
        recorder.stop();
      }
      if (handler.key === this.options.captureKey) {
        console.log('want to capture');
        this.emitData(RecordType.CAPTURE, { id: id++ });
      }
      event.preventDefault();
      return false;
    });
  }
}

const defaultStopKey = 'ctrl+s';
const defaultCaptureKey = 'ctrl+c';

export class CtrlPlugin implements RecorderPlugin {
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
