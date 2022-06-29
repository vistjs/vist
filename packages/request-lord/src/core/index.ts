import ConfigCenter, { Config } from './ConfigCenter';
import FetchInterceptor from './interceptors/fetch';
import XMLHttpRequestInterceptor from './interceptors/xml-http-request';

/**
 * 请求拦截器
 * 根据请求的不同阶段，注入不同的钩子：
 * 请求发起：可修改请求参数
 * 请求执行：可替换实际的请求方法
 * 请求返回：可修改返回数据
 */

export default class Interceptor {
  configCenter = new ConfigCenter();
  global: Window | typeof globalThis;

  constructor({
    requestConfigs,
    commonConfig,
  }: {
    requestConfigs?: Config[];
    commonConfig?: Config;
  } = {}) {
    if (requestConfigs) {
      requestConfigs.forEach((c) => this.configCenter.saveRequestConfig(c));
    }
    if (commonConfig) {
      this.configCenter.saveCommonConfig(commonConfig);
    }

    this.global = this.getGlobal();
    this.intercept();
  }

  getGlobal() {
    if (typeof window !== 'undefined') {
      return window;
    } else if (typeof global !== 'undefined') {
      return global;
    }
    throw new Error('Detect global variable error');
  }

  private intercept() {
    const fetchInterceptor = new FetchInterceptor(this);
    const xmlHttpInterceptor = new XMLHttpRequestInterceptor(this);
    fetchInterceptor.intercept();
    xmlHttpInterceptor.intercept();
  }

  saveRequestConfig(config: Config) {
    this.configCenter.saveRequestConfig(config);
  }

  saveCommonConfig(config: Config) {
    this.configCenter.saveCommonConfig(config);
  }

  getHandlers(url: string) {
    const commonConfig = this.configCenter.getCommonConfig();
    const requestConfig = this.configCenter.getRequestConfig(url);

    // 指定 url 和 method 的配置比公共配置优先
    const requestCatcher = requestConfig?.requestCatcher || commonConfig.requestCatcher;
    const requestHanler = requestConfig?.requestHanler || commonConfig.requestHanler;
    const responseCatcher = requestConfig?.responseCatcher || commonConfig.responseCatcher;

    return {
      requestCatcher,
      requestHanler,
      responseCatcher,
    };
  }
}
