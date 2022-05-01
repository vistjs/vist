import { renderAll } from './render';
import { RecordDbData, ReplayInternalOptions, PlayerEventTypes } from '../types';
import { getTime, delay, observer, AnimationFrame } from '../utils';

import { Store } from './stores';
import { reaction, toJS } from 'mobx';
import { PlayerModule } from '.';
export class PlayerComponent {
  target: HTMLElement;
  options: ReplayInternalOptions;

  records: RecordDbData[];
  speed = 0;
  recordIndex = 0;
  frameIndex = 0;
  frameInterval: number;
  maxFrameInterval = 250;
  frames: number[];
  maxFps = 30;

  initTime: number;
  startTime: number;
  animationDelayTime = 300;
  elapsedTime = 0;

  viewIndex = 0;

  RAF: AnimationFrame;
  isJumping: boolean;

  maxIntensityStep = 8;

  c: PlayerModule;

  constructor(options: ReplayInternalOptions, c: PlayerModule) {
    this.c = c;
    this.options = options;
    this.init();
  }

  private watchPlayerSpeed(speed: number) {
    const curSpeed = this.speed;
    this.speed = speed;
    observer.emit(PlayerEventTypes.SPEED, speed);

    if (speed > 0) {
      this.play();
      if (curSpeed === 0) {
        observer.emit(PlayerEventTypes.PLAY);
      }
    } else {
      this.pause();
    }
  }

  private watchProgress(endTime: any) {
    this.recalculateProgress();
  }

  private listenStore() {
    reaction(() => Store.playerStore.speed, this.watchPlayerSpeed.bind(this));

    reaction(() => Store.progressStore.endTime, this.watchProgress.bind(this));
  }

  private async init() {
    this.calcFrames();

    this.listenStore();

    observer.on(PlayerEventTypes.JUMP, async (state: { time: number; percent?: number }) => this.jump(state, true));

    observer.on(PlayerEventTypes.RESIZE, async () => {
      // wait for scaling page finish to get target offsetWidth
      await delay(500);
      this.recalculateProgress();
    });

    observer.on(PlayerEventTypes.PROGRESS, (frame: number) => {
      const percent = frame / (this.frames.length - 1);
    });

    this.c.hooks.render.tap('inner render', (context, record, options) => {
      renderAll.call(context, record, options);
    });
  }

  private initViewState() {
    this.records = this.processing(toJS(Store.replayDataStore.records));
  }

  public async jump(state: { time: number; percent?: number }, shouldLoading = false) {
    this.isJumping = true;
    const { time, percent } = state;

    const frameIndex =
      1 +
      this.frames.findIndex((t, i) => {
        const cur = t;
        const next = this.frames[i + 1] || cur + 1;
        if (time >= cur && time <= next) {
          return true;
        }
      });

    this.initViewState();

    this.frameIndex = frameIndex;
    this.initTime = getTime();
    this.recordIndex = 0;
    this.startTime = time;

    this.playAudio();
    this.loopFramesByTime(this.frames[this.frameIndex]);

    this.isJumping = false;
  }

  private loopFramesByTime(currTime: number, isJumping = false) {
    let nextTime = this.frames[this.frameIndex];

    while (nextTime && currTime >= nextTime) {
      if (!isJumping) {
        observer.emit(PlayerEventTypes.PROGRESS, this.frameIndex, this.frames.length - 1);
      }
      this.frameIndex++;
      this.renderEachFrame();
      nextTime = this.frames[this.frameIndex];
    }
    return nextTime;
  }

  private play() {
    this.playAudio();

    if (this.RAF && this.RAF.requestID) {
      this.RAF.stop();
    }

    this.RAF = new AnimationFrame(loop.bind(this), this.maxFps);
    this.options.destroyStore.add(() => this.RAF.stop());
    this.RAF.start();

    this.initTime = getTime();
    this.startTime = this.frames[this.frameIndex];

    this.initViewState();

    async function loop(this: PlayerComponent, t: number, loopIndex: number) {
      const timeStamp = getTime() - this.initTime;
      if (this.frameIndex > 0 && this.frameIndex >= this.frames.length) {
        this.stop();
        return;
      }

      const currTime = this.startTime + timeStamp * this.speed;
      this.loopFramesByTime(currTime);

      this.elapsedTime = (currTime - this.frames[0]) / 1000;

      this.syncAudio();
      this.syncVideos();
    }
  }

  private playAudio() {}

  private syncAudio() {}

  private syncAudioTargetNode() {}

  private syncVideos() {}

  private pauseAudio() {}

  private pauseVideos() {}

  private renderEachFrame() {
    let data: RecordDbData;
    while (
      this.recordIndex < this.records.length &&
      (data = this.records[this.recordIndex]).time <= this.frames[this.frameIndex]
    ) {
      this.execFrame(data);
      this.recordIndex++;
    }
  }

  public pause(emit = true) {
    if (this.RAF) {
      this.RAF.stop();
    }
    Store.playerStore.setSpeed(0);
    this.pauseAudio();
    this.pauseVideos();
    if (emit) {
      observer.emit(PlayerEventTypes.PAUSE);
    }
  }

  private stop() {
    this.speed = 0;
    this.recordIndex = 0;
    this.frameIndex = 0;
    this.elapsedTime = 0; // unit: sec
    this.pause();
    observer.emit(PlayerEventTypes.STOP);
  }

  private execFrame(record: RecordDbData) {
    const { isJumping, speed } = this;
    // renderAll.call(this, record, { isJumping, speed });
    this.c.hooks.render.call(this, record, { isJumping, speed });
  }

  private calcFrames(maxInterval = this.maxFrameInterval) {
    const preTime = this.frames && this.frames[this.frameIndex];
    const { duration, startTime, endTime } = Store.progressStore;
    this.frameInterval = Math.max(20, Math.min(maxInterval, (duration / 60 / 1000) * 60 - 40));
    const interval = this.frameInterval;
    const frames: number[] = [];
    let nextFrameIndex: number | undefined;
    for (let i = startTime; i < endTime + interval; i += interval) {
      frames.push(i);
      if (!nextFrameIndex && preTime && i >= preTime) {
        nextFrameIndex = frames.length - 1;
      }
    }
    frames.push(endTime);
    if (nextFrameIndex) {
      this.frameIndex = nextFrameIndex!;
    }
    this.frames = frames;
  }

  private orderRecords(records: RecordDbData[]) {
    if (!records.length) {
      return [];
    }

    records.sort((a: RecordDbData, b: RecordDbData) => {
      return a.time - b.time;
    });

    return records;
  }

  private recalculateProgress() {
    this.calcFrames();
  }

  private processing(records: RecordDbData[]) {
    return this.orderRecords(records);
  }
}
