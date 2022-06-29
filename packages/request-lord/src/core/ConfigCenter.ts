/**
 * 配置存储中心
 */

import minimatch from 'minimatch';

export type Config = {
  pattern: string | RegExp;
  method?: Method;
  requestCatcher?: (params: RequestPayload) => RequestPayload;
  requestHanler?: (params: RequestPayload) => Promise<ResponsePayload>;
  responseCatcher?: (params: ResponsePayload) => ResponsePayload;
};

export default class ConfigCenter {
  private requestConfigs: Config[];
  private commonConfig: Config;

  constructor() {
    this.requestConfigs = [];
    this.commonConfig = { pattern: '*' };
  }

  findRequestConfig(url?: string) {
    // url 作为标识符
    const index = this.requestConfigs.findIndex(({ pattern }) => {
      let urlMatched;
      if (pattern instanceof RegExp) {
        urlMatched = pattern.test(url || '');
      } else {
        urlMatched = minimatch(url || '', pattern, { partial: true });
      }
      return urlMatched;
    });
    if (index >= 0) {
      return {
        index,
        config: this.requestConfigs[index],
      };
    } else {
      return null;
    }
  }

  saveRequestConfig(config: Config) {
    const confIndex = this.requestConfigs.findIndex(({ pattern, method }) => {
      return pattern.toString() === config.pattern.toString() && method === config.method;
    });
    if (confIndex > 0) {
      this.requestConfigs[confIndex] = {
        ...this.requestConfigs[confIndex],
        ...config,
      };
    } else {
      this.requestConfigs.push(config);
    }
  }

  getRequestConfig(url: string) {
    const conf = this.findRequestConfig(url);
    return conf ? conf.config : null;
  }

  saveCommonConfig(config: Config) {
    this.commonConfig = {
      ...this.commonConfig,
      ...config,
    };
  }

  getCommonConfig() {
    return this.commonConfig;
  }
}
