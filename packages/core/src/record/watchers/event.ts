import { Watcher } from '../watcher';
import { RecordType } from '../../constants/record';
import type { RecordData } from '../../types';
import { cloneKeys, getReactInstanceFromNode, getNodeClientXY, getClientXY } from '../../utils';

const listenerAttr: { [k: string]: string } = {
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  mouseover: 'onMouseEnter',
  mouseout: 'onMouseLeave',
};

type DomData = Pick<RecordData<RecordType.EVENT>, 'data' | 'dom'>;

export class EventWatcher extends Watcher {
  protected init() {
    const eventDataKeys = ['clientX', 'clientY', 'pageX', 'pageY', 'screenX', 'screenY', 'type'];
    this.registerEvent({
      context: document,
      eventTypes: ['mouseenter', 'mouseleave', 'mouseover', 'mouseout'],
      listenerOptions: { capture: true },
      handleFn: async (event: MouseEvent) => {
        const target = event.target;
        if (!this.checkTargetListener(target as HTMLElement, event.type)) {
          return;
        }

        const eventData: DomData = {
          dom: { x: event.clientX, y: event.clientY },
          data: { ...cloneKeys(event, eventDataKeys) },
        };
        if ((event.type === 'mouseenter' || event.type === 'mouseover') && event.relatedTarget) {
          eventData.data.relatedTarget = getNodeClientXY(event.relatedTarget);
        }
        // mouseleave mouseout clientX is belong to relativeTarget
        if ((event.type === 'mouseleave' || event.type === 'mouseout') && event.relatedTarget) {
          eventData.dom = getClientXY(target);
          eventData.data.relatedTarget = { x: event.clientX, y: event.clientY };
        }
        console.log(`${event.type}`, event);
        this.push(eventData);
      },
    });
  }

  private push({ dom, data }: DomData) {
    this.emitData(RecordType.EVENT, data, dom);
  }

  private checkTargetListener(dom: HTMLElement, eventName: string) {
    const dom0Event = `on${eventName}`;
    if (dom.hasOwnProperty(dom0Event)) {
      return true;
    }
    const reactIns = getReactInstanceFromNode(dom);
    if (reactIns && reactIns.hasOwnProperty(listenerAttr[eventName])) {
      return true;
    }
    // TODO vue
    // TODO angular
    return false;
  }
}
