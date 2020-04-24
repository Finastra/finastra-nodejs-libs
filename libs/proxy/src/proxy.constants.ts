import { Server } from 'http-proxy';

export const PROXY_MODULE_OPTIONS = 'ProxyModuleOptions';
export const HTTP_PROXY = 'httpProxy';

export const defaultProxyOptions: Server.ServerOptions = {
  changeOrigin: true,
  timeout: 60000 * 5,
};
