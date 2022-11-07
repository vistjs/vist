import { PlayerComponent } from './player';
import type { RecordData } from '../types';
import { RecordType } from '../constants';
import * as Render from './renders';

export async function renderAll(this: PlayerComponent, recordData: RecordData) {
  const { type } = recordData;

  // waiting for mouse or scroll transform animation finish

  switch (type) {
    case RecordType.MOUSE: {
      Render.renderMouse(recordData as RecordData<RecordType.MOUSE>);
      break;
    }
    case RecordType.INPUT: {
      Render.renderInput(recordData as RecordData<RecordType.INPUT>);
      break;
    }
    case RecordType.DRAG: {
      Render.renderDrag(recordData as RecordData<RecordType.DRAG>);
      break;
    }
    case RecordType.EVENT: {
      Render.renderEvent(recordData as RecordData<RecordType.EVENT>);
      break;
    }
    case RecordType.SCROLL: {
      Render.renderScroll(recordData as RecordData<RecordType.SCROLL>);
      break;
    }
    default: {
      break;
    }
  }
}
