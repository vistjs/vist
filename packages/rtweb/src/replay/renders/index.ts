import { renderClick, renderInput } from './react/action';

function unknownEngine(x: never): never {
  throw new Error('unknown engine');
}

type SupportEngine = 'react';

export function genRenders(engine: SupportEngine) {
  switch (engine) {
    case 'react':
      return {
        renderClick,
        renderInput,
      };
    default:
      return unknownEngine(engine);
  }
}
