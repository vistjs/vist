import { Watcher } from '../watcher';
import type { eventWithTime, inputData, mouseInteractionData, scrollData } from 'rrweb/typings/types.d';
import { record, EventType, IncrementalSource } from 'rrweb';
import { isMouseEvent, getMouseEventName, setClientXY, getClientXY } from '../../utils';
import { RecordType, RecorderEventTypes } from '../../constants/record';
import type { RecordData } from '../../types';

function nodeStore(node: any) {
  if (node.id) {
    if (typeof node.x !== 'undefined' && typeof node.y !== 'undefined') {
      return { x: node.x, y: node.y };
    }
  }
  return getClientXY(node.id);
}

const actionSources = [
  IncrementalSource.MouseInteraction,
  IncrementalSource.Scroll,
  IncrementalSource.ViewportResize,
  IncrementalSource.Input,
  IncrementalSource.Drag,
];

type PushData<T extends RecordType = RecordType> = Pick<RecordData<T>, 'type' | 'dom' | 'data'>;

type Rule = {
  judge: (record: eventWithTime, watcher?: ActionWatcher) => boolean;
  emitData?: (record: eventWithTime, watcher?: ActionWatcher) => PushData;
  next?: Rule | Rule[];
};

// return nested rule
const composeRule = (rules: any): Rule => {
  return rules.reduce((p: any, c: any) => {
    if (typeof p === 'function') {
      p = { judge: p };
    }
    p.next = typeof c === 'function' ? { judge: c } : c;
    return p;
  });
};

const isIncrementalSnapshot: Rule['judge'] = (record: eventWithTime) => {
  return record.type === EventType.IncrementalSnapshot;
};

const isInterestedIncrementalSource: Rule['judge'] = (record: eventWithTime) => {
  return actionSources.includes((record.data as any).source);
};

const isMouseRecord: Rule = {
  judge: (record: eventWithTime) => {
    return isMouseEvent(record.data);
  },
  emitData: (record: eventWithTime): PushData<RecordType.MOUSE> => {
    return {
      type: RecordType.MOUSE,
      dom: nodeStore(record.data),
      // antd slider use mousedown event`s clientX
      data: {
        clientX: (record.data as mouseInteractionData).x,
        clientY: (record.data as mouseInteractionData).y,
        type: getMouseEventName(record.data as mouseInteractionData),
      },
    };
  },
};

const isInputRecord: Rule = {
  judge: (record: eventWithTime, watcher?: ActionWatcher) => {
    if ((record.data as inputData).source === IncrementalSource.Input) {
      return true;
    }
    return false;
  },
  emitData: (record: eventWithTime, watcher?: ActionWatcher): PushData<RecordType.INPUT> => {
    return {
      type: RecordType.INPUT,
      dom: nodeStore(record.data),
      data: { text: (record.data as inputData).text, isChecked: (record.data as inputData).isChecked },
    };
  },
};

const isScrollRecord: Rule = {
  judge: (record: eventWithTime, watcher?: ActionWatcher) => {
    if ((record.data as scrollData).source === IncrementalSource.Scroll) {
      return true;
    }
    return false;
  },
  emitData: (record: eventWithTime, watcher?: ActionWatcher): PushData<RecordType.SCROLL> => {
    return {
      type: RecordType.SCROLL,
      dom: nodeStore(record.data),
      data: { x: (record.data as scrollData).x, y: (record.data as scrollData).y, id: (record.data as scrollData).id },
    };
  },
};

const sniffMoveEvent: Rule = {
  judge: (record: eventWithTime) => {
    const source = (record.data as any).source;
    if ([IncrementalSource.MouseMove, IncrementalSource.TouchMove, IncrementalSource.Drag].includes(source)) {
      const lastPos = (record.data as any).positions[(record.data as any).positions.length - 1];
      setClientXY(lastPos.id, lastPos.x, lastPos.y);
      // console.log('setClientXY', record.data);
    }
    return false;
  },
};

const interestedRecords: Rule[] = [
  composeRule([
    isIncrementalSnapshot,
    isInterestedIncrementalSource,
    [sniffMoveEvent, isMouseRecord, isInputRecord, isScrollRecord],
  ]),
];

export class ActionWatcher extends Watcher {
  private stopRecord: Function | undefined;
  public data: eventWithTime[] = [];
  public status: RecorderEventTypes = RecorderEventTypes.INIT;

  protected init() {
    this.context.addEventListener('beforeunload', this.handleFn);

    this.stopRecord = record({
      emit: (recordData) => {
        if (this.status === RecorderEventTypes.STOP) {
          return;
        }
        this.filter(recordData);
      },
      sampling: {
        mousemove: 50,
        // Set the trigger frequency of scroll events
        scroll: 150, // Trigger at most once every 150ms
        // set the interval of media interaction event
        media: 800,
        // Set the recording time of the input event
        input: 'last', // For continuous input, only the final value is recorded
      },
    });

    this.status = RecorderEventTypes.RECORD;

    this.uninstall(() => {
      this.stopRecord?.();
      this.status = RecorderEventTypes.STOP;
    });
  }

  private handleFn() {
    // do some sync job
    // navigator.sendBeacon(url, data)
    // this.emitData(this.wrapData())
  }

  private push(record: eventWithTime, extras: PushData) {
    this.data.push(record);
    this.emitData(extras.type, extras.data, extras.dom, record);
  }

  // filter rule pipeline
  // [a->b->[c, b]], in array c or b, if first one return true, break
  // interestedRecords head and tail can be array，others not use array
  private filter(record: eventWithTime) {
    const rules: Array<Rule | Rule[]> = [...interestedRecords];
    let rule;
    while ((rule = rules.shift())) {
      if (Array.isArray(rule)) {
        for (const sub of rule) {
          const { judge, emitData } = sub;
          if (judge(record, this)) {
            const pushData = emitData?.(record, this);
            pushData && this.push(record, pushData);
            break;
          }
        }
      } else {
        const { judge, emitData, next } = rule;
        if (!judge(record, this)) {
          continue;
        }
        if (next) {
          //deep walk
          rules.push(next);
        } else {
          const pushData = emitData?.(record, this);
          pushData && this.push(record, pushData);
        }
      }
    }
  }
}
