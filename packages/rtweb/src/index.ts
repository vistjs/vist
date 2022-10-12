import { Recorder } from './record';
import { Player } from './replay';
import { SavePlugin } from './record/savePlugin';
import { getUrlParam, getRecordsFromDB, stubHttp } from './utils';
import { LOCAL_DB_NAME, PLAY_PARAM } from './constant';

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
  requestMock?: string[];
};

export default class Rtweb {
  recorder: Recorder;
  player: Player;
  constructor(options?: OPTIONS) {
    this.init(options);
  }

  async init(options?: OPTIONS) {
    const dbName = options?.dbName || LOCAL_DB_NAME;
    const playParam = options?.playParam || PLAY_PARAM;
    const recordId = getUrlParam(playParam);
    const recordInfo = getUrlParam('recordInfo');
    let frames: any;
    let apis: any;
    if (window.rtFetchRecords) {
      [frames, apis] = await window.rtFetchRecords();
    }
    const isReplay = recordId || frames;
    const requestMock =
      options?.requestMock && options.remoteUrl
        ? [...options?.requestMock, `!${options.remoteUrl}/api/open/case`]
        : options?.requestMock;
    const polly = stubHttp(isReplay, requestMock, apis);
    if (isReplay) {
      this.player = new Player({
        receiver: async (cb) => {
          if (frames) {
            return cb(frames);
          }

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
            : getRecordsFromDB(dbName).then((res: any) => {
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
      this.player.on('stop' as any, async () => {
        await polly.stop();
      });
    } else {
      this.recorder = new Recorder({
        plugins: [new SavePlugin({ dbName, remoteUrl: options?.remoteUrl, pid: options?.pid })],
      });
      this.recorder.on('stop' as any, async () => {
        await polly.stop();
      });
    }
  }
}
