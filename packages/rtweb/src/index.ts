import { Recorder } from './record';
import { Player } from './replay';
import { SavePlugin } from './record/savePlugin';
import { getUrlParam, getRecordsFromDB } from './utils';
import { LOCAL_DB_NAME, PLAY_PARAM } from './constant';
// import lord from 'request-lord';

export { Recorder, Player, getUrlParam };

type OPTIONS = {
  dbName?: string;
  remoteUrl?: string;
  pid?: number;
  playParam?: string;
  hotkeys?: {
    stop?: string;
    capture?: string;
  };
};

export default class Rtweb {
  recorder: Recorder;
  player: Player;
  constructor(options?: OPTIONS) {
    const dbName = options?.dbName || LOCAL_DB_NAME;
    const playParam = options?.playParam || PLAY_PARAM;
    const recordId = getUrlParam(playParam);
    const recordInfo = getUrlParam('recordInfo');
    if (recordId) {
      this.player = new Player({
        receiver: (cb) => {
          options?.remoteUrl
            ? fetch(`${options.remoteUrl}/api/open/case?id=${recordId}`, {
                method: 'GET',
                mode: 'cors',
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  // console.log('response', response);
                  return response.json();
                })
                .then((res) => {
                  const frames = res?.data?.cases?.frames || [];
                  cb(frames);
                })
            : getRecordsFromDB(LOCAL_DB_NAME).then((res: any) => {
                console.log(JSON.stringify(res));
                const info = `w${res.w}h${res.h}`;
                if (recordInfo !== info) {
                  window.open(
                    `${window.location.href}&recordInfo=${info}`,
                    'rtwebWindow',
                    `width=${res.w},height=${res.h}`
                  );
                } else {
                  cb(res.frames);
                }
              });
        },
      });
      // lord('https://paul.ren/api/say').resBody((params: any) => {
      //   console.log('resBody hook', params);
      //   return 'mock res';
      // });
    } else {
      this.recorder = new Recorder({
        plugins: [new SavePlugin({ dbName, remoteUrl: options?.remoteUrl, pid: options?.pid })],
      });
      // lord('https://paul.ren/api/say').response((params: any) => {
      //   console.log('response hook', params);
      // });
    }
  }
}
