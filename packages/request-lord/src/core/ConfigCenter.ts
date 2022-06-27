/**
 * 配置存储中心
 */

export type Config = {
  pattern: string;
  method?: Method;
  requestCatcher?: (params: RequestPayload) => RequestPayload;
  requestHanler?: (params: RequestPayload) => ResponsePayload;
  responseCatcher?: (params: ResponsePayload) => ResponsePayload;
};

export default class ConfigCenter {
  private requestConfigs: Config[];
  private commonConfig: Config;

  constructor() {
    this.requestConfigs = [];
    this.commonConfig = { pattern: '*' };
  }

  findRequestConfig(url?: string, method?: Method) {
    // url 作为标识符
    const index = this.requestConfigs.findIndex((c) => c.pattern === url);
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
    const conf = this.findRequestConfig(config.pattern, config.method);
    if (conf) {
      this.requestConfigs[conf.index] = {
        ...conf.config,
        ...config,
      };
    } else {
      this.requestConfigs.push(config);
    }
  }

  getRequestConfig(url: string, method: Method) {
    const conf = this.findRequestConfig(url, method);
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
