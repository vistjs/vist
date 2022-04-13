import { record, EventType, IncrementalSource, MouseInteractions } from 'rrweb';

export function isClick(data: any){
  return data.source  === IncrementalSource.MouseInteraction && (data.type === MouseInteractions.Click  ||  data.type === MouseInteractions.DblClick)
}