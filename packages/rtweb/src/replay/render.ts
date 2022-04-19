import { delay } from '../utils';
import { PlayerComponent } from './player'
import { RecordDbData, RecordType } from '../types'
import { genRenders } from './renders'

const {
  renderClick,
  renderInput
} = genRenders('react');

export async function renderAll(
    this: PlayerComponent,
    recordData: RecordDbData,
    opts?: { speed: number; isJumping: boolean }
) {
    const { isJumping, speed } = opts || {}
    const delayTime = isJumping ? 0 : 200
    const { type } = recordData

    // waiting for mouse or scroll transform animation finish
    const actionDelay = () => (delayTime ? delay(delayTime) : Promise.resolve())

    switch (type) {
        case RecordType.CLICK: {
          renderClick(recordData);
          break;
        }
        case RecordType.INPUT: {
          renderInput(recordData);
          break;
        }
        default: {
            break
        }
    }
}