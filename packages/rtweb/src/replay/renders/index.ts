import { renderMouse, renderInput, renderScroll } from './react/action';
import { renderDrag } from './react/drag';
import { renderEvent } from './react/event';

function unknownEngine(x: never): never {
  throw new Error('unknown engine');
}

type SupportEngine = 'react';

export function genRenders(engine: SupportEngine) {
  switch (engine) {
    case 'react':
      return {
        renderMouse,
        renderInput,
        renderDrag,
        renderEvent,
        renderScroll,
      };
    default:
      return unknownEngine(engine);
  }
}
