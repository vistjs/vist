import localforage from 'localforage';
import ReactTestUtils from 'react-dom/test-utils'; // ES6
import { eventWithTime, inputData } from 'rrweb/typings/types.d'
import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';
import { isClick } from './utils';
import domtoimage from 'dom-to-image';

localforage.config({name: 'webtravel'});

// 数据拉取从options传
// 通过插件化replay，写一个插件，通过接口上报断点截图

function timeout(ms:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitRun(fn: Function, ms:number){
  await timeout(ms)
  await fn();
}

function renderClick(node: any){
  ReactTestUtils.Simulate.click(node);
}

function renderInput(node: any, value: string){
  node.value = value;
  ReactTestUtils.Simulate.change(node);
}

export function replay(){
  localforage.getItem('frames').then(async (actions: any)=>{
    let timestamp = 0;
    let action:eventWithTime['data'] & { timestamp:number;x: number;y:number } ;
    for ( action of actions) {
      const wait = action.timestamp - timestamp > 1000000 ? 0 : action.timestamp - timestamp;
      timestamp = action.timestamp;
      await waitRun(()=>{
        if(isClick(action)){
          const node = document.elementFromPoint(action.x, action.y);
          renderClick(node);
        }
        if((action as inputData).source === IncrementalSource.Input){
          const node = document.elementFromPoint(action.x, action.y);
          renderInput(node, (action as inputData).text)
          domtoimage.toJpeg(document.body, { quality: 0.95 })
          .then(function (dataUrl: any) {
              var link = document.createElement('a');
              link.download = 'webtravel.jpeg';
              link.href = dataUrl;
              link.click();
          });
        }
        console.log('wait', wait);
      },wait);
    }
  })
}

export default function useReplay(){

}

export async function renderAll(
    this: PlayerComponent,
    recordData: RecordData,
    opts?: { speed: number; isJumping: boolean }
) {
    const { isJumping, speed } = opts || {}
    const delayTime = isJumping ? 0 : 200
    const { type, data } = recordData

    // waiting for mouse or scroll transform animation finish
    const actionDelay = () => (delayTime ? delay(delayTime) : Promise.resolve())

    switch (type) {
        case RecordType.SNAPSHOT: {
            renderSnapshot(data as SnapshotRecord['data'])
            break
        }

        case RecordType.SCROLL: {
            renderScroll.call(this, data)
            break
        }
        case RecordType.WINDOW: {
            renderWindow.call(this, data)
            break
        }
        case RecordType.MOUSE: {
            renderMouse.call(this, data)
            break
        }
        case RecordType.DOM: {
            if (!isJumping && speed === 1) {
                await actionDelay()
            }
            renderDom(data as DOMRecordData)
            break
        }
        case RecordType.FORM_EL: {
            if (!isJumping && speed === 1) {
                await actionDelay()
            }
            renderFormEl(data as FormElementRecordData, { isJumping })
            break
        }
        case RecordType.LOCATION: {
            renderLocation(data as LocationRecordData)
            break
        }
        case RecordType.CANVAS_SNAPSHOT: {
            renderCanvasSnapshot(data as CanvasSnapshotRecordData)
            break
        }
        case RecordType.CANVAS: {
            if (!isJumping && speed === 1) {
                await actionDelay()
            }
            renderCanvas2D(data as CanvasRecordData)
            break
        }
        case RecordType.FONT: {
            renderFont.call(this, data as CanvasRecordData)
            break
        }
        case RecordType.PATCH: {
            renderPatch(data as PreFetchRecordData)
            break
        }
        case RecordType.WEBGL: {
            renderWebGL(data as WebGLRecordData)
            break
        }
        default: {
            break
        }
    }
}