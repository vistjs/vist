// 从rrweb数据源过滤的插件import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';
import { eventWithTime } from 'rrweb/typings/types.d'
import EventEmitter  from 'eventemitter3'
import localforage from 'localforage';
import { isClick } from './utils';
import { replay } from './useReplay';

// x 通过插件化record，写一个localforage插件将record数据插入indexDB中， 远程server插件
// 通过插件化record，写一个过滤操作流的插件filter关心的oplogs && 规整数据
// 一个可以识别快捷键的打断点插件

// api stub 通过options参数启用

const EE = new EventEmitter();

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

const actionSources = [IncrementalSource.MouseInteraction, IncrementalSource.Scroll, IncrementalSource.ViewportResize, IncrementalSource.Input, IncrementalSource.Drag];



export class Recorder{
  private stopFn;
  private actions: eventWithTime['data'][];
  constructor() {
    this.stopFn = record({
      emit(event) {
        EE.emit('data', event)
      },
      sampling: {
        // 不录制鼠标移动事件
        mousemove: false,
        // 设置滚动事件的触发频率
        scroll: 150, // 每 150ms 最多触发一次
        // set the interval of media interaction event
        media: 800,
        // 设置输入事件的录制时机
        input: 'last' // 连续输入时，只录制最终值
      }
    });
    this.actions = [];
    this.watchActions();
    localforage.config({name: 'webtravel'});
    window.uploadRecord = this.upload.bind(this)
    window.webReplay = replay;
  }

  watchActions(){
    EE.on('data', (event: eventWithTime)=>{
      if(event.type === EventType.IncrementalSnapshot){
        if(!actionSources.includes(event.data.source)){
          return;
        }
        const subType = event.data.source  === IncrementalSource.MouseInteraction ? MouseInteractionName[event.data.type] : '';
        console.log(souceName[event.data.source], subType, event.data);
        // MouseInteraction只监听click和dbclick
        if(isClick(event.data)){
          this.actions.push({...event.data, timestamp: event.timestamp});
        }
        // 上次是click且id一样的input 为input输入框的change事件，保存此次input事件
        if(event.data.source  === IncrementalSource.Input){
          const preEvent = this.actions[this.actions.length -1] as any || {};
          if(isClick(preEvent) && event.data.id === preEvent.id){
            this.actions.push({...event.data, timestamp: event.timestamp, x: preEvent.x, y: preEvent.y});
          }
        }
      }
    })
  }

  stop(){
    this.stopFn && this.stopFn();
  }

  onData(cb: (...args: any[]) => void){
    EE.on('data', cb)
  }

  upload(){
    console.log('list', this.actions);
    localforage.setItem('frames', this.actions).then(()=>{
      this.actions = [];
    });
  }
}