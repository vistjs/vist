// const { Polly } = require('@pollyjs/core');
// const XHRAdapter = require('@pollyjs/adapter-xhr');
// const FetchAdapter = require('@pollyjs/adapter-fetch');
// const LocalStoragePersister = require('@pollyjs/persister-local-storage');
import { Polly } from '@pollyjs/core';
import XHRAdapter from '@pollyjs/adapter-xhr';
import FetchAdapter from '@pollyjs/adapter-fetch';
import LocalStoragePersister from '@pollyjs/persister-local-storage';
import multimatch from 'multimatch';
import { POLLY_DB_NAME } from '../constants';

const protocolReg = /^(!?)https?:\/\//;

export function stubHttp(isReplay = false, requestMock?: string[], restore?: string) {
  Polly.register(XHRAdapter);
  Polly.register(FetchAdapter);
  Polly.register(LocalStoragePersister);
  if (!isReplay) {
    localStorage.removeItem(POLLY_DB_NAME);
  }
  if (restore) {
    localStorage.setItem(POLLY_DB_NAME, restore);
  }
  const polly = new Polly('vist', {
    adapters: ['xhr', 'fetch'],
    persister: 'local-storage',
    persisterOptions: {
      'local-storage': {
        key: POLLY_DB_NAME,
      },
    },
    flushRequestsOnStop: true,
  });
  const { server } = polly;
  server
    .any()
    .filter((req: { url: string }) => {
      if (requestMock) {
        requestMock = requestMock.map((url) => url.replace(protocolReg, '$1'));
        const flag = !multimatch([req.url.replace(protocolReg, '')], requestMock).length;
        console.log(`${req.url} is ${flag ? 'not' : ''} match:`);
        return flag;
      }
      return true;
    })
    .passthrough();
  return polly;
}
