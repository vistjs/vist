import ReactTestUtils from 'react-dom/test-utils';
import { RecordDbData } from '../../../types'

export function renderClick(data: RecordDbData){
    const node = document.elementFromPoint(data.x, data.y) as HTMLElement;
    ReactTestUtils.Simulate.click(node);
}
  
export function renderInput(data: RecordDbData){
    const node = document.elementFromPoint(data.x, data.y) as HTMLInputElement;
    node.value = data.text;
    ReactTestUtils.Simulate.change(node);
}