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
  const polly = new Polly('rtweb', {
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
    .filter((req) => {
      if (requestMock) {
        requestMock = requestMock.map((url) => url.replace(protocolReg, '$1'));
        return !multimatch([req.url.replace(protocolReg, '')], requestMock).length;
      }
      return true;
    })
    .passthrough();
  return polly;
}
