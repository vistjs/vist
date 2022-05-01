import { delay } from '../utils';
import { PlayerComponent } from './player';
import { RecordDbData, RecordType } from '../types';
import { genRenders } from './renders';

const Render = genRenders('react');

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
      Render.renderMouse(recordData);
      break;
    }
    case RecordType.INPUT: {
      Render.renderInput(recordData);
      break;
    }
    case RecordType.DRAG: {
      Render.renderDrag(recordData);
      break;
    }
    case RecordType.EVENT: {
      Render.renderEvent(recordData);
      break;
    }
    default: {
      break;
    }
  }
}
