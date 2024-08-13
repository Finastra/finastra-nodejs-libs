import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SERVER_INSTANCE_ID } from '../logger.module';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(@Inject(SERVER_INSTANCE_ID) private serverInstanceID: string) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let req = context.switchToHttp().getRequest();
    let log = false;

    if (context['contextType'] !== 'graphql') {
      log = true;
      this.logger.log(`START: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url} instanceID: ${this.serverInstanceID}`);
    }

    return next.handle().pipe(
      tap(() => {
        if (log) {
          this.logger.log(`STOP: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url} instanceID: ${this.serverInstanceID}`);
        }
      }),
    );
  }
}
