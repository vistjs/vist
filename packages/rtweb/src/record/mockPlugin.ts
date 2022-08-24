// import lord, { ResponsePayload } from 'request-lord';
import Store from 'request-lord/src/store';
import { RecorderModule } from '.';

export class MockPlugin {
  private responseData: ResponsePayload[] = [];

  apply(recorder: RecorderModule) {
    const id = 1; // 临时 id
    const { plugin } = recorder;
    const store = new Store(id);

    // lord('**/api/**').response((data: ResponsePayload) => {
    //   console.log(data);
    //   this.responseData.push(data);
    // });

    plugin('end', () => {
      store.saveResponses(this.responseData);
    });
  }
}
