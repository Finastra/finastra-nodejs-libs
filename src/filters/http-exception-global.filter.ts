
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionGlobalFilter implements ExceptionFilter {
  readonly logger = new Logger(HttpExceptionGlobalFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { body, headers, method, params, query, url, user } = request;

    this.logger.error({ request: { body, headers, method, params, query, url, user }, exception });

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url
      });
  }
}
