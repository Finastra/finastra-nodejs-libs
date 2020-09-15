import {
  Controller,
  Res,
  Logger,
  Request as NestRequest,
  All,
  Param,
} from '@nestjs/common';
import { ProxyService } from '../services';
import { Response, Request } from 'express';

@Controller('/:tenantId/:channelType/proxy')
export class ProxyMultitenantController {
  private readonly logger = new Logger(ProxyMultitenantController.name);

  constructor(private proxyService: ProxyService) {}

  @All('')
  async proxy(
    @Res() response: Response,
    @NestRequest() request: Request,
    @Param() params,
  ) {
    try {
      this.proxyService.proxyRequest(request, response, params);
    } catch (err) {
      const msg = 'An error occurred while making the proxy call';

      response.status(500).send({ error: msg });

      this.logger.error(msg, err, 'Proxy');
    }
  }
}
