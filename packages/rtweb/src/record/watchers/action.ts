import { Watcher } from '../watcher';
import { eventWithTime, inputData, mouseInteractionData, scrollData } from 'rrweb/typings/types.d';
import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';
import { isMouseEvent, getMouseEventName, setClientXY, getClientXY } from '../../utils';
import { RecordType, RecordData, RecorderStatus } from '../../types';

function nodeStore(node: any) {
  if (node.id) {
    if (typeof node.x !== 'undefined' && typeof node.y !== 'undefined') {
      return { x: node.x, y: node.y };
    }
  }
  return getClientXY(node.id);
}

const sourceName = {
  [IncrementalSource.Mutation]: 'Mutation',
  [IncrementalSource.MouseMove]: 'MouseMove',
  [IncrementalSource.MouseInteraction]: 'MouseInteraction',
  [IncrementalSource.Scroll]: 'Scroll',
  [IncrementalSource.ViewportResize]: 'ViewportResize',
  [IncrementalSource.Input]: 'Input',
  [IncrementalSource.TouchMove]: 'TouchMove',
  [IncrementalSource.MediaInteraction]: 'MediaInteraction',
  [IncrementalSource.StyleSheetRule]: 'StyleSheetRule',
  [IncrementalSource.CanvasMutation]: 'CanvasMutation',
  [IncrementalSource.Font]: 'Font',
  [IncrementalSource.Log]: 'Log',
  [IncrementalSource.Drag]: 'Drag',
  [IncrementalSource.StyleDeclaration]: 'StyleDeclaration',
};

const MouseInteractionName = {
  [MouseInteractions.MouseUp]: 'MouseUp',
  [MouseInteractions.MouseDown]: 'MouseDown',
  [MouseInteractions.Click]: 'Click',
  [MouseInteractions.ContextMenu]: 'ContextMenu',
  [MouseInteractions.DblClick]: 'DblClick',
  [MouseInteractions.Focus]: 'Focus',
  [MouseInteractions.Blur]: 'Blur',
  [MouseInteractions.TouchStart]: 'TouchStart',
  [MouseInteractions.TouchMove_Departed]: 'TouchMove_Departed',
  [MouseInteractions.TouchEnd]: 'TouchEnd',
  [MouseInteractions.TouchCancel]: 'TouchCancel',
};

const actionSources = [
  IncrementalSource.MouseInteraction,
  IncrementalSource.Scroll,
  IncrementalSource.ViewportResize,
  IncrementalSource.Input,
  IncrementalSource.Drag,
];

type Rule = {
  judge: (record: eventWithTime, watcher?: ActionWatcher) => boolean;
  handle?: (record: eventWithTime, watcher?: ActionWatcher) => RecordData['extras'] & { type: RecordType };
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
  handle: (record: eventWithTime) => {
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
  judge: (record: eventWithTime, watcher: ActionWatcher) => {
    if ((record.data as inputData).source === IncrementalSource.Input) {
      return true;
    }
    return false;
  },
  handle: (record: eventWithTime, watcher: ActionWatcher) => {
    return {
      type: RecordType.INPUT,
      dom: nodeStore(record.data),
      data: { text: (record.data as inputData).text, isChecked: (record.data as inputData).isChecked },
    };
  },
};

const isScrollRecord: Rule = {
  judge: (record: eventWithTime, watcher: ActionWatcher) => {
    if ((record.data as scrollData).source === IncrementalSource.Scroll) {
      return true;
    }
    return false;
  },
  handle: (record: eventWithTime, watcher: ActionWatcher) => {
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

export class ActionWatcher extends Watcher<any> {
  private stopRecord: Function | undefined;
  public data: eventWithTime[] = [];
  public status: RecorderStatus = RecorderStatus.PAUSE;

  protected init() {
    this.context.addEventListener('beforeunload', this.handleFn);

    this.stopRecord = record({
      emit: (recordData) => {
        if (this.status === RecorderStatus.HALT) {
          return;
        }
        // console.log(
        //   //@ts-ignore xxx
        //   `TYPE:${recordData.type}, source: ${
        //     //@ts-ignore xxx
        //     recordData.data.source
        //   }, data: `,
        //   recordData.data
        // );
        if (recordData.type === 3) {
          // console.log(
          //   //@ts-ignore xxx
          //   `rrweb record, source:${sourceName[recordData.data.source]}, type: ${
          //     //@ts-ignore xxx
          //     MouseInteractionName[recordData.data.type]
          //   }, data: `,
          //   recordData.data
          // );
          // console.log(`mirror: `, record.mirror);
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

    this.status = RecorderStatus.RUNNING;

    this.uninstall(() => {
      this.stopRecord?.();
      this.status = RecorderStatus.HALT;
    });
  }

  private handleFn() {
    // do some sync job
    // navigator.sendBeacon(url, data)
    // this.emitData(this.wrapData())
  }

  private push(type: any, record: eventWithTime, extras: any) {
    this.data.push(record);
    this.emitData(type, record, extras);
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
          const { judge, handle } = sub;
          if (judge(record, this)) {
            const { type, ...extras } = handle?.(record, this) || {};
            this.push(type, record, extras);
            break;
          }
        }
      } else {
        const { judge, handle, next } = rule;
        if (!judge(record, this)) {
          continue;
        }
        if (next) {
          //deep walk
          rules.push(next);
        } else {
          const { type, ...extras } = handle?.(record, this) || {};
          this.push(type, record, extras);
        }
      }
    }
  }
}
