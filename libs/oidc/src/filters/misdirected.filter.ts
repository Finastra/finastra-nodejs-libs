import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpStatus } from '../interfaces';

@Catch(HttpException)
export class MisdirectedFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    if (status === HttpStatus.MISDIRECTED) {
      const requestedTenant = request.params.tenantId;
      const requestedChannel = request.params.channelType;
      const originalTenant = request.user.userinfo.tenant;
      const originalChannel = request.user.userinfo.channel;
      response.redirect(
        `/tenant-switch-warn?requestedTenant=${requestedTenant}&requestedChannel=${requestedChannel}&originalTenant=${originalTenant}&originalChannel=${originalChannel}`,
      );
    } else {
      response.status(exception.getStatus()).json(exception['response']);
    }
  }
}
