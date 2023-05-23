import { Inject, Injectable, Logger, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import * as server from 'http-proxy';
import { ProxyModuleOptions } from '../interfaces';
import { HTTP_PROXY, PROXY_MODULE_OPTIONS } from '../proxy.constants';
import { concatPath, getBaseURL } from '../utils';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    @Inject(HTTP_PROXY) private proxy: server | any,
    @Inject(PROXY_MODULE_OPTIONS) private options: ProxyModuleOptions,
  ) {}

  async proxyRequest(req: Request, res: Response, @Param() params?) {
    const target = req.query.target as string;
    const serviceId = req.query.serviceId as string;
    let token = null;

    if (req.hasOwnProperty('user')) {
      token = (req.user as any).authTokens.accessToken;
    }

    const prefix = params ? `${params[0]}` : '';

    if (target && !serviceId) {
      const error = `Cannot make a proxy call without a serviceId`;
      this.logger.warn(error);
      return res.status(500).send({
        error,
      });
    }

    if (serviceId) {
      const services = new Map(
        this.options.services ? this.options.services.map(service => [service.id, service]) : [],
      );
      if (services.has(serviceId)) {
        const service = services.get(serviceId);
        const baseUrl = service.url;
        return this.doProxy(
          req,
          res,
          target ? concatPath(baseUrl, prefix, target) : baseUrl,
          service.forwardToken === false ? null : token,
          service.config,
        );
      } else {
        const error = `Could not find serviceId ${serviceId}`;
        this.logger.warn(error);
        return res.status(404).send({
          error,
        });
      }
    }

    res.status(404).send({ error: "Could not find 'target' or 'serviceId'" });
    this.logger.error("Could not find 'target' or 'serviceId'");
  }

  private async doProxy(
    req: Request,
    res: Response,
    target: string,
    token: string,
    options: server.ServerOptions = {},
  ) {
    const url = new URL(target);
    req.url = `${url.pathname}${url.search}`;

    const defaultOptions = {
      target: getBaseURL(target),
      headers: {
        ...(token && { authorization: 'Bearer ' + token }),
      },
    };

    // Set default "Accept" header if not provided by request headers or is set to "*/*"
    if (!('accept' in req.headers) || req.headers.accept === '*/*') {
      defaultOptions.headers['accept'] = 'application/json'
    }

    // Set default "Content-Type" header if not provided by request headers
    if (!('content-type' in req.headers)) {
      defaultOptions.headers['content-type'] = 'application/json'
    }

    // Allow http-server options overriding
    const requestOptions = { ...defaultOptions, ...options };
    requestOptions.headers = {
      ...defaultOptions.headers,
      ...(options && options.headers),
    }; // To deep extend headers

    this.proxy.web(req, res, requestOptions, err => {
      if (err.code === 'ECONNRESET') return;

      this.logger.error(`Error ${err.code} while proxying ${req.method} ${req.url}`);

      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });

      res.end('An error occurred while proxying the request');
    });
  }
}
