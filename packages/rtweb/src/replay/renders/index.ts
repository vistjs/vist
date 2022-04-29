import { renderMouse, renderInput } from './react/action';
import { renderDrag } from './react/drag';

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
      };
    default:
      return unknownEngine(engine);
  }
}
