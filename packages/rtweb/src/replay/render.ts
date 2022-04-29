import { delay } from '../utils';
import { PlayerComponent } from './player';
import { RecordDbData, RecordType } from '../types';
import { genRenders } from './renders';

const { renderMouse, renderInput, renderDrag } = genRenders('react');

export async function renderAll(
  this: PlayerComponent,
  recordData: RecordDbData,
  opts?: { speed: number; isJumping: boolean }
) {
  const { isJumping, speed } = opts || {};
  const delayTime = isJumping ? 0 : 200;
  const { type } = recordData;

  // waiting for mouse or scroll transform animation finish
  const actionDelay = () => (delayTime ? delay(delayTime) : Promise.resolve());

  switch (type) {
    case RecordType.MOUSE: {
      renderMouse(recordData);
      break;
    }
    case RecordType.INPUT: {
      renderInput(recordData);
      break;
    }
    case RecordType.DRAG: {
      renderDrag(recordData);
      break;
    }
    default: {
      break;
    }
  }
}
