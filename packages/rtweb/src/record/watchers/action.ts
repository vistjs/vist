import { Watcher } from '../watcher';
import { eventWithTime, inputData, mouseInteractionData } from 'rrweb/typings/types.d';
import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';
import { isClickEvent, isMouseEvent, getMouseEventName } from '../../utils';
import { RecordType, RecordData } from '../../types';

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

// 返回嵌套的rule
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
      dom: { x: (record.data as mouseInteractionData).x, y: (record.data as mouseInteractionData).y },
      data: {
        x: (record.data as mouseInteractionData).x,
        y: (record.data as mouseInteractionData).y,
        type: getMouseEventName(record.data as mouseInteractionData),
      },
    };
  },
};

const isInputRecord: Rule = {
  judge: (record: eventWithTime, watcher: ActionWatcher) => {
    // 上次是click且id一样的input 为input输入框的change事件，保存此次input事件
    if ((record.data as inputData).source === IncrementalSource.Input) {
      let preClick;
      for (let i = watcher.data.length - 1; i >= 0; i--) {
        const preEvent = watcher.data[i] as any;
        if (isClickEvent(preEvent.data)) {
          preClick = preEvent;
          break;
        }
      }
      if (preClick && (record.data as inputData).id === preClick.data.id) {
        return true;
      }
    }
    return false;
  },
  handle: (record: eventWithTime, watcher: ActionWatcher) => {
    let preClick;
    for (let i = watcher.data.length - 1; i >= 0; i--) {
      const preEvent = watcher.data[i] as any;
      if (isClickEvent(preEvent.data)) {
        preClick = preEvent;
        break;
      }
    }
    return {
      type: RecordType.INPUT,
      dom: { x: preClick.data?.x, y: preClick.data?.y },
      data: { text: (record.data as inputData).text },
    };
  },
};

const interestedRecords: Rule[] = [
  composeRule([isIncrementalSnapshot, isInterestedIncrementalSource, [isMouseRecord, isInputRecord]]),
];

export class ActionWatcher extends Watcher<any> {
  private stopRecord: Function | undefined;
  public data: eventWithTime[] = [];

  protected init() {
    this.context.addEventListener('beforeunload', this.handleFn);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.stopRecord = record({
      emit(recordData) {
        // console.log(
        //   //@ts-ignore xxx
        //   `TYPE:${recordData.type}, source: ${
        //     //@ts-ignore xxx
        //     recordData.data.source
        //   }, data: `,
        //   recordData.data
        // );
        if (recordData.type === 3) {
          console.log(
            //@ts-ignore xxx
            `rrweb record, source:${sourceName[recordData.data.source]}, type: ${
              //@ts-ignore xxx
              MouseInteractionName[recordData.data.type]
            }, data: `,
            recordData.data
          );
          //@ts-ignore xxx
          // console.log(`mirror: `, record.mirror.getNode(recordData.data.id));
        }

        that.filter(recordData);
      },
      sampling: {
        // 不录制鼠标移动事件
        mousemove: false,
        // 设置滚动事件的触发频率
        scroll: 150, // 每 150ms 最多触发一次
        // set the interval of media interaction event
        media: 800,
        // 设置输入事件的录制时机
        input: 'last', // 连续输入时，只录制最终值
      },
    });

    this.uninstall(() => {
      this.stopRecord?.();
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

  // 过滤规则流水线
  // 如何处理嵌套？[a->b->[c, b]], 数组内是或的关系，中了就不继续后面
  // interestedRecords首尾可以是数组，中间请不要用数组
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
          //深度遍历
          rules.push(next);
        } else {
          const { type, ...extras } = handle?.(record, this) || {};
          this.push(type, record, extras);
        }
      }
    }
  }
}
