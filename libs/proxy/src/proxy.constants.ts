import { Server } from 'http-proxy';

export const USER_ID_HEADER = 'X-FFDC-USER_ID';

export const defaultProxyOptions: Server.ServerOptions = {
  changeOrigin: true,
};
