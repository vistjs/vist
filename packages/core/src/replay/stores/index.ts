import PlayerStore from './playerStore';
import ProgressStore from './progressStore';
import ReplayDataStore from './replayDataStore';
export * from './playerStore';
export * from './progressStore';
export * from './replayDataStore';

export class RootStore {
  playerStore;
  progressStore;
  replayDataStore;

  constructor() {
    this.playerStore = new PlayerStore(this);
    this.progressStore = new ProgressStore(this);
    this.replayDataStore = new ReplayDataStore(this);
  }
}

export const Store = new RootStore();
