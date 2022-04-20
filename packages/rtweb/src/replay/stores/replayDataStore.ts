import { makeObservable, observable, action } from 'mobx';

import { RecordDbData } from '../../types';

import { RootStore } from '.';

const initState = {
  records: [] as RecordDbData[],
};

export type ReplayDataState = typeof initState;

export default class ReplayDataStore {
  rootStore;
  records = initState.records;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeObservable(this, {
      records: observable,
      updateData: action,
      reset: action,
    });
  }

  updateData(data: ReplayDataState) {
    Object.assign(this, data);
  }

  reset() {
    Object.assign(this, initState);
  }
}
