import { Recorder } from './record';
import { Player } from './replay';
import { localDBPlugin } from './record/localDBPlugin';

const localDbName = 'rtweb-records';

export function createLocalDbRecord() {
  return new Recorder({ plugins: [new localDBPlugin({ dbName: localDbName })] });
}

export { Recorder, Player };
