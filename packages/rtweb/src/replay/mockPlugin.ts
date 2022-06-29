import lord, { RequestPayload, ResponsePayload, Method } from 'request-lord';
import Store from 'request-lord/src/store';
import { PlayerModule } from '.';

export class MockPlugin {
  private responseData: ResponsePayload[] = [];

  apply(rePlayer: PlayerModule) {
    const id = 1; // 临时 id
    const store = new Store(id);
    this.responseData = store.getResponses();

    lord('**/api/**')
      .tapHook('replaceStatus', ({ url, method }: RequestPayload) => {
        const res = this.getResData(url, method);
        return res ? res.status : null;
      })
      .tapHook('resHeaders', ({ url, method }: RequestPayload) => {
        const res = this.getResData(url, method);
        return res ? res.headers : null;
      })
      .tapHook('resBody', ({ url, method }: RequestPayload) => {
        const res = this.getResData(url, method);
        return res ? res.body : null;
      });
  }

  private getResData(url: string, method: Method) {
    return this.responseData.find((res) => res.url === url && res.method === method);
  }
}
