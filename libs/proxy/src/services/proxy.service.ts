import { Injectable, Inject, Logger } from '@nestjs/common';
import { Server } from 'http-proxy';
import { parse } from 'url';
import { Request, Response } from 'express';
import { ProxyModuleOptions } from '../interfaces';
import {
  USER_ID_HEADER,
  PROXY_MODULE_OPTIONS,
  HTTP_PROXY,
} from '../proxy.constants';
import { concatPath, getBaseURL } from '../utils';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    @Inject(HTTP_PROXY) private proxy: Server | any,
    @Inject(PROXY_MODULE_OPTIONS) private options: ProxyModuleOptions,
  ) {}

  async proxyRequest(req: Request, res: Response) {
    const target = req.query.target;
    const serviceId = req.query.serviceId;
    let token = null;

    if (req.hasOwnProperty('user')) {
      token = (req.user as any).access_token;
    }

    if (target && !serviceId) {
      return this.doProxy(req, res, target, token);
    }

    if (serviceId) {
      const services = new Map(
        this.options.services
          ? this.options.services.map(service => [service.id, service])
          : [],
      );
      if (services.has(serviceId)) {
        const service = services.get(serviceId);
        const baseUrl = service.url;
        return this.doProxy(
          req,
          res,
          target ? concatPath(baseUrl, target) : baseUrl,
          token,
          service.options,
        );
      } else {
        const error = `Could not find serviceId ${serviceId}`;
        this.logger.warn(error);
        return res.status(500).send({
          error,
        });
      }
    }

    res.status(500).send({ error: "Could not find 'target' or 'serviceId'" });
    this.logger.error("Could not find 'target' or 'serviceId'", 'Proxy');
  }

  private async doProxy(
    req: Request,
    res: Response,
    target: string,
    token: string,
    options: Server.ServerOptions = {},
  ) {
    let userId = null;
    if (
      req.user &&
      (req.user as any).userinfo &&
      (req.user as any).userinfo.username
    ) {
      userId = (req.user as any).userinfo.username;
    }

    req.url = parse(target).path;

    let defaultOptions = {
      target: getBaseURL(target),
      headers: {
        ...(token && { authorization: 'Bearer ' + token }),
        [USER_ID_HEADER]: userId,
        'content-type': 'application/json',
        accept: 'application/json',
      },
    };

    // Allow http-server options overriding
    const requestOptions = { ...defaultOptions, ...options };
    requestOptions.headers = {
      ...defaultOptions.headers,
      ...(options && options.headers),
    }; // To deep extend headers

    this.proxy.web(req, res, requestOptions, function(err) {
      if (err.code === 'ECONNRESET') return;
      throw new Error(err);
    });
  }
}
