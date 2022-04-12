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