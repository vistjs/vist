import { makeObservable, observable, action } from 'mobx';
import { RootStore } from '.';

const initState = {
  startTime: 0,
  endTime: 0,
  duration: 0,
};

export type ProgressState = typeof initState;

export default class ProgressStore {
  rootStore;
  startTime = initState.startTime;
  endTime = initState.endTime;
  duration = initState.duration;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      startTime: observable,
      endTime: observable,
      duration: observable,
      setProgress: action,
      reset: action,
    });
  }

  setProgress(data: ProgressState) {
    Object.assign(this, data);
  }

  reset() {
    Object.assign(this, initState);
  }
}
