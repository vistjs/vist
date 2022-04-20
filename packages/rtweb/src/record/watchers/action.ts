import { Watcher } from '../watcher';
import { eventWithTime, inputData, mouseInteractionData } from 'rrweb/typings/types.d';
import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';
import { isClick } from '../../utils';
import { RecordType } from '../../types';

/*
const souceName = {
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
}
  
  
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
}

*/

const actionSources = [
  IncrementalSource.MouseInteraction,
  IncrementalSource.Scroll,
  IncrementalSource.ViewportResize,
  IncrementalSource.Input,
  IncrementalSource.Drag,
];

type Rule = {
  judge: (record: eventWithTime, watcher?: ActionWatcher) => boolean;
  handle?: (record: eventWithTime, watcher?: ActionWatcher) => any;
  next?: Rule | Rule[];
};

type PossibleRule = Rule | Rule['judge'];

// 返回嵌套的rule
const composeRule = (rules: any) => {
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

const isClickRecord = {
  judge: (record: eventWithTime) => {
    return isClick(record.data);
  },
  handle: (record: eventWithTime) => {
    return {
      type: RecordType.CLICK,
      x: (record.data as mouseInteractionData).x,
      y: (record.data as mouseInteractionData).y,
    };
  },
};

const isInputRecord = {
  judge: (record: eventWithTime, watcher: ActionWatcher) => {
    // 上次是click且id一样的input 为input输入框的change事件，保存此次input事件
    if ((record.data as inputData).source === IncrementalSource.Input) {
      const preEvent = (watcher.data[watcher.data.length - 1] as any) || {};
      if (isClick(preEvent) && (record.data as inputData).id === preEvent.id) {
        return true;
      }
    }
    return false;
  },
  handle: (record: eventWithTime, watcher: ActionWatcher) => {
    const preEvent = (watcher.data[watcher.data.length - 1] as any) || {};
    return { type: RecordType.INPUT, x: preEvent.data?.x, y: preEvent.data?.y, text: (record.data as inputData).text };
  },
};

const interestedRecords = [
  composeRule([isIncrementalSnapshot, isInterestedIncrementalSource, [isClickRecord, isInputRecord]]),
];

export class ActionWatcher extends Watcher<any> {
  private stopRecord: Function | undefined;
  public data: eventWithTime[];

  protected init() {
    this.context.addEventListener('beforeunload', this.handleFn);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.stopRecord = record({
      emit(record) {
        that.filter(record);
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

  private push(type: RecordType, record: eventWithTime, extras: any) {
    this.data.push(record);
    this.emitData(type, record, extras);
  }

  // 过滤规则流水线
  // 如何处理嵌套？[a->b->[c, b]], 数组内是或的关系，中了就不继续后面
  // interestedRecords首尾可以是数组，中间请不要用数组
  private filter(record: eventWithTime) {
    const rules = [...interestedRecords];
    let rule;
    while ((rule = rules.shift())) {
      if (Array.isArray(rule)) {
        for (const sub of rule) {
          const { judge, handle } = sub;
          if (judge(record)) {
            const extras = handle(record, this);
            this.push(extras.type, record, extras);
            break;
          }
        }
      } else {
        const { judge, handle, next } = rule;
        if (!judge(record)) {
          continue;
        }
        if (next) {
          //深度遍历
          rules.push(next);
        } else {
          const extras = handle(record, this);
          this.push(extras.type, record, extras);
        }
      }
    }
  }
}
