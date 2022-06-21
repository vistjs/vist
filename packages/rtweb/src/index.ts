import { Recorder } from './record';
import { Player } from './replay';
import { localDBPlugin } from './record/localDBPlugin';
import { getUrlParam, getRecordsFromDB } from './utils';
import { LOCAL_DB_NAME } from './constant';

export function createLocalDbRecorder() {
  return new Recorder({ plugins: [new localDBPlugin({ dbName: LOCAL_DB_NAME })] });
}

export function createLocalDbPlayer() {
  return new Player({
    receiver: (cb) => {
      getRecordsFromDB(LOCAL_DB_NAME).then(cb);
    },
  });
}

export { Recorder, Player, getUrlParam };
