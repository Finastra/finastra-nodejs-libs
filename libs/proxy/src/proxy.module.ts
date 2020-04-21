import { Module, Logger } from '@nestjs/common';
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { createProxyServer } from 'http-proxy';
import * as queryString from 'querystring';
import { concatPath } from './utils';
import { ProxyService } from './services';
import { ProxyController } from './controllers';
import {
  defaultProxyOptions,
  PROXY_MODULE_OPTIONS,
  HTTP_PROXY,
} from './proxy.constants';
import { ProxyModuleOptions } from './interfaces';

const proxyFactory = {
  provide: HTTP_PROXY,
  useFactory: async (options: ProxyModuleOptions) => {
    const logger = new Logger('httpProxy');
    const proxy = createProxyServer({
      ...defaultProxyOptions,
      ...options.config,
    });

    proxy.on('proxyReq', function(proxyReq, req, res, options) {
      const url = concatPath(proxyReq.getHeader('host'), req.url);
      logger.log(`Sending ${req.method} ${url}`, 'Proxy');

      if (!req.body || !Object.keys(req.body).length) {
        return;
      }

      const contentType = proxyReq.getHeader('Content-Type');
      let bodyData;

      if (contentType === 'application/json') {
        bodyData = JSON.stringify(req.body);
      }

      if (contentType === 'application/x-www-form-urlencoded') {
        bodyData = queryString.stringify(req.body);
      }

      if (bodyData) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    });

    proxy.on('proxyRes', function(proxyRes, req, res) {
      const url = concatPath(proxyRes.req.getHeader('host'), req.url);
      logger.log(`Received ${req.method} ${url}`, 'Proxy');
    });
    return proxy;
  },
  inject: [PROXY_MODULE_OPTIONS],
};

@Module({
  providers: [ProxyService, proxyFactory],
  controllers: [ProxyController],
})
export class ProxyModule extends createConfigurableDynamicRootModule<
  ProxyModule,
  ProxyModuleOptions
>(PROXY_MODULE_OPTIONS) {}
