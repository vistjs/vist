import { RecorderModule } from '.';
import { RecorderPlugin } from './pluginable';
import hotkeys from 'hotkeys-js';
import { Watcher } from './watcher';
import { RecordType } from '../constants';
import { setUrlParam } from '../utils/common';

type OPTIONS = {
  stopKey?: string;
  captureKey?: string;
  replayKey?: string;
};

class HotKeysWatcher extends Watcher {
  init() {
    const { recorder } = this.installOptions;
    let id = 1;
    const recordUrl = window.location.href;
    hotkeys([this.options.stopKey, this.options.captureKey, this.options.replayKey].join(','), (event, handler) => {
      if (handler.key === this.options.stopKey) {
        console.log('want to stop');
        recorder.stop();
      }
      if (handler.key === this.options.captureKey) {
        console.log('want to capture');
        this.emitData(RecordType.CAPTURE, { id: id++ });
      }
      if (handler.key === this.options.replayKey) {
        console.log('want to replay');
        window.location.replace(setUrlParam(recordUrl, 'replaySoon', '1'));
      }
      event.preventDefault();
      return false;
    });
  }
}

const defaultStopKey = 'ctrl+s';
const defaultCaptureKey = 'ctrl+c';
const defaultReplayKey = 'ctrl+r';

export class CtrlPlugin implements RecorderPlugin {
  private stopKey: string;
  private captureKey: string;
  private replayKey: string;

  constructor(options: OPTIONS) {
    /** init plugin options */
    this.stopKey = options.stopKey || defaultStopKey;
    this.captureKey = options.captureKey || defaultCaptureKey;
    this.replayKey = options.replayKey || defaultReplayKey;
  }

  apply(recorder: RecorderModule) {
    const { addWatcher } = recorder;

    addWatcher(
      new HotKeysWatcher({
        stopKey: this.stopKey,
        captureKey: this.captureKey,
        replayKey: this.replayKey,
      })
    );
  }
}
