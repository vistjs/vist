import { Watcher } from '../watcher';
import { RecordType, RecordData } from '../../types';
import { cloneKeys, getReactInstanceFromNode, getNodeClientXY, getClientXY } from '../../utils';

const listenerAttr: { [k: string]: string } = {
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  mouseover: 'onMouseEnter',
  mouseout: 'onMouseLeave',
};

export class EventWatcher extends Watcher<any> {
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
        const eventData = { dom: { x: event.clientX, y: event.clientY }, ...cloneKeys(event, eventDataKeys) };
        if ((event.type === 'mouseenter' || event.type === 'mouseover') && event.relatedTarget) {
          eventData.relatedTarget = getNodeClientXY(event.relatedTarget);
        }
        // mouseleave mouseout clientX is belong to relativeTarget
        if ((event.type === 'mouseleave' || event.type === 'mouseout') && event.relatedTarget) {
          eventData.dom = getClientXY(target);
          eventData.relatedTarget = { x: event.clientX, y: event.clientY };
        }
        console.log(`${event.type}`, event);
        this.push(RecordType.EVENT, eventData);
      },
    });
  }

  private push(type: RecordType, { dom, ...data }: RecordData['extras']) {
    this.emitData(type, null, { dom, data });
  }

  private checkTargetListener(dom: HTMLElement, eventName: string) {
    const dom0Event = `on${eventName}`;
    if (dom.hasOwnProperty(dom0Event)) {
      return true;
    }
    // TODO this just consider chrome and react, need to perfect
    // @ts-ignore xxxx
    const dom2listeners = (window.getEventListeners && window.getEventListeners(dom)) || {};
    if (!!dom2listeners[eventName]) {
      return true;
    }
    const reactIns = getReactInstanceFromNode(dom);
    if (reactIns && reactIns.hasOwnProperty(listenerAttr[eventName])) {
      return true;
    }
    return false;
  }
}
