/**
 * 数据存取
 */

const NAMESPACE = 'REQ_LORD';

export default class Store {
  private namespace: string;

  constructor(cid: string | number) {
    this.namespace = `${cid}_${NAMESPACE}`;
  }

  private getKey(key: string) {
    return `${this.namespace}-${key}`;
  }

  private doSave(key: string, value: any) {
    localStorage.setItem(this.getKey(key), JSON.stringify({ value }));
  }

  private doGet(key: string) {
    const data = localStorage.getItem(this.getKey(key));
    if (data) {
      return JSON.parse(data).value;
    } else {
      return null;
    }
  }

  saveResponses(data: ResponsePayload[]) {
    this.doSave('responses', data);
  }

  getResponses(): ResponsePayload[] {
    return this.doGet('responses');
  }
}
