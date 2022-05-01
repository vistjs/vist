import { Watcher } from '../watcher';
import { RecordType, RecordData } from '../../types';
import { cloneKeys } from '../../utils';

export class DragWatcher extends Watcher<any> {
  protected init() {
    const eventDataKeys = [
      'altKey',
      'button',
      'buttons',
      'clientX',
      'clientY',
      'ctrlKey',
      'metaKey',
      'pageX',
      'pageY',
      'screenX',
      'screenY',
      'shiftKey',
      'type',
    ];
    const dragWm = new WeakMap();
    const dragOverWm = new WeakMap();
    let draggingNode: HTMLElement | null;
    let draggingInfo: any;
    this.registerEvent({
      context: window,
      eventTypes: ['drag', 'dragstart', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop'],
      handleFn: (event) => {
        if (event.type === 'drag') {
          if (dragWm.get(event.target)) {
            return;
          } else {
            dragWm.set(event.target, true);
          }
        }
        if (event.type === 'dragstart') {
          draggingNode = event.target;
          draggingInfo = {
            x: event.clientX,
            y: event.clientY,
          };
        }
        if (event.type === 'dragover') {
          if (dragOverWm.get(event.target)) {
            return;
          } else {
            dragOverWm.set(event.target, true);
          }
        }
        const eventData = cloneKeys(event, eventDataKeys);
        if (draggingNode) {
          eventData.draggingInfo = draggingInfo;
        }
        if (event.type === 'drop') {
          draggingNode && dragWm.delete(event.target);
          dragOverWm.delete(event.target);
          draggingNode = null;
        }

        if (event.type === 'dragend') {
          dragWm.delete(event.target);
          dragOverWm.delete(event.target);
          draggingNode = null;
        }

        // dragenter: clientX and target is entered node relatedTarget is dragging node
        // dragleave: clientX and relativeTarget is leaved node  target is dragging node
        if (event.type === 'dragenter') {
          eventData.relatedTarget = {
            x: draggingInfo.x,
            y: draggingInfo.y,
          };
        }
        eventData.dom = {
          x: eventData.clientX,
          y: eventData.clientY,
        };
        if (event.type === 'dragleave') {
          eventData.relatedTarget = {
            x: eventData.clientX,
            y: eventData.clientY,
          };
          eventData.dom = {
            x: draggingInfo.x,
            y: draggingInfo.y,
          };
        }

        console.log(`${event.type}`, event);
        this.push(RecordType.DRAG, eventData);
      },
    });
  }

  private push(type: RecordType, { dom, ...data }: RecordData['extras']) {
    this.emitData(type, null, { dom, data });
  }
}
