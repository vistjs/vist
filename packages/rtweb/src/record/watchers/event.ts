import { Watcher } from '../watcher';
import { RecordType, RecordData } from '../../types';
import { cloneKeys } from '../../utils';

export class EventWatcher extends Watcher<any> {
  protected init() {
    const eventDataKeys = ['clientX', 'clientY', 'pageX', 'pageY', 'screenX', 'screenY', 'type'];
    this.registerEvent({
      context: document,
      eventTypes: ['mouseenter', 'mouseleave'],
      listenerOptions: { capture: true },
      handleFn: async (event: MouseEvent) => {
        const eventData = { dom: { x: event.clientX, y: event.clientY }, ...cloneKeys(event, eventDataKeys) };
        console.log(`${event.type}`, event);
        this.push(RecordType.EVENT, eventData);
      },
    });
  }

  private push(type: RecordType, { dom, ...data }: RecordData['extras']) {
    this.emitData(type, null, { dom, data });
  }
}
