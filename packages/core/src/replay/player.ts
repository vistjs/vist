import { renderAll } from './render';
import type { RecordData, ReplayInternalOptions } from '../types';
import { PlayerEventTypes } from '../constants';
import { getTime, delay, observer, AnimationFrame } from '../utils';
import { Store } from './stores';
import { reaction, toJS } from 'mobx';
import { PlayerModule } from '.';
export class PlayerComponent {
  options: ReplayInternalOptions;
  records!: RecordData[];
  speed = 0;
  recordIndex = 0;
  frameIndex = 0;
  frameInterval!: number;
  maxFrameInterval = 250;
  frames!: number[];
  maxFps = 30;

  initTime!: number;
  startTime!: number;
  animationDelayTime = 300;
  elapsedTime = 0;

  viewIndex = 0;

  RAF!: AnimationFrame;
  isJumping!: boolean;

  maxIntensityStep = 8;

  container: PlayerModule;

  constructor(options: ReplayInternalOptions, container: PlayerModule) {
    this.container = container;
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

  private watchProgress() {
    this.recalculateProgress();
  }

  private listenStore() {
    reaction(() => Store.playerStore.speed, this.watchPlayerSpeed.bind(this));

    reaction(() => Store.progressStore.endTime, this.watchProgress.bind(this));
  }

  private async init() {
    this.calcFrames();

    this.listenStore();

    observer.on(PlayerEventTypes.JUMP, async (state: { time: number; percent?: number }) => this.jump(state));

    observer.on(PlayerEventTypes.RESIZE, async () => {
      // wait for scaling page finish to get target offsetWidth
      await delay(500);
      this.recalculateProgress();
    });

    this.container.hooks.render.tap('render', (context, record) => {
      renderAll.call(context, record);
    });
  }

  private initViewState() {
    this.records = this.processing(toJS(Store.replayDataStore.records));
  }

  public async jump(state: { time: number; percent?: number }) {
    this.isJumping = true;
    const { time } = state;

    const frameIndex =
      1 +
      this.frames.findIndex((t, i) => {
        const cur = t;
        const next = this.frames[i + 1] || cur + 1;
        if (time >= cur && time <= next) {
          return true;
        }
        return false;
      });

    this.initViewState();

    this.frameIndex = frameIndex;
    this.initTime = getTime();
    this.recordIndex = 0;
    this.startTime = time;

    this.playAudio();
    this.loopFramesByTime(this.frames[frameIndex] as number);

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

  public play() {
    this.playAudio();

    if (this.RAF && this.RAF.requestID) {
      this.RAF.stop();
    }

    this.RAF = new AnimationFrame(loop.bind(this), this.maxFps);
    this.options.destroyStore.add(() => this.RAF.stop());
    this.RAF.start();

    this.initTime = getTime();
    this.startTime = this.frames[this.frameIndex] as number;

    this.initViewState();

    async function loop(this: PlayerComponent) {
      const timeStamp = getTime() - this.initTime;
      if (this.frameIndex > 0 && this.frameIndex >= this.frames.length) {
        this.stop();
        return;
      }

      const currTime = this.startTime + timeStamp * this.speed;
      this.loopFramesByTime(currTime);

      this.elapsedTime = (currTime - this.frames[0]!) / 1000;

      this.syncAudio();
      this.syncVideos();
      this.syncAudioTargetNode();
    }
  }

  private playAudio() {}

  private syncAudio() {}

  private syncAudioTargetNode() {}

  private syncVideos() {}

  private pauseAudio() {}

  private pauseVideos() {}

  private renderEachFrame() {
    let data: RecordData;
    while (
      this.recordIndex < this.records.length &&
      (data = this.records[this.recordIndex]!).time <= this.frames[this.frameIndex]!
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

  public stop() {
    this.speed = 0;
    this.recordIndex = 0;
    this.frameIndex = 0;
    this.elapsedTime = 0; // unit: sec
    this.pause();
    observer.emit(PlayerEventTypes.STOP);
    this.container.hooks.stop.call(this);
  }

  private execFrame(record: RecordData) {
    const { isJumping, speed } = this;
    this.container.hooks.render.call(this, record, { isJumping, speed });
  }

  private calcFrames(maxInterval = this.maxFrameInterval) {
    const preTime = this.frames && this.frames[this.frameIndex];
    const { duration, startTime, endTime } = Store.progressStore;
    if (duration <= 0) return;
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

  private orderRecords(records: RecordData[]) {
    if (!records.length) {
      return [];
    }

    records.sort((a: RecordData, b: RecordData) => {
      return a.time - b.time;
    });

    return records;
  }

  private recalculateProgress() {
    this.calcFrames();
  }

  private processing(records: RecordData[]) {
    return this.orderRecords(records);
  }
}
