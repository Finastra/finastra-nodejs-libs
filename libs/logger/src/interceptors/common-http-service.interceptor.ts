import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {
    this.logger.setContext('http');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log(
      `START: ${context.getClass().name}.${context.getHandler().name}(): ${
        context.switchToHttp().getRequest().method
      } ${context.switchToHttp().getRequest().url}`,
    );

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `STOP: ${context.getClass().name}.${context.getHandler().name}(): ${
              context.switchToHttp().getRequest().method
            } ${context.switchToHttp().getRequest().url}`,
          ),
        ),
      );
  }
}
