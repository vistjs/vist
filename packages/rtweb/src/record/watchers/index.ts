import { ActionWatcher } from './action';
import { DragWatcher } from './drag';
import { EventWatcher } from './event';

export const baseWatchers = {
  ActionWatcher,
  DragWatcher,
  // EventWatcher,
};

export const watchers = {
  ...baseWatchers,
};
