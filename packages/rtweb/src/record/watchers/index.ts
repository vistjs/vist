import { ActionWatcher } from './action';
import { DragWatcher } from './drag';
import { EventWatcher } from './event';

const baseWatchers = {
  ActionWatcher: new ActionWatcher(),
  DragWatcher: new DragWatcher(),
  EventWatcher: new EventWatcher(),
};

export const watchers = {
  ...baseWatchers,
};
