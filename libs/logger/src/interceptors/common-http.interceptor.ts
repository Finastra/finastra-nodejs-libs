import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  // readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(private logger: Logger) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let req = context.switchToHttp().getRequest();
    let log = false;

    if (context['contextType'] !== 'graphql') {
      log = true;
      this.logger.log(`START: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url}`);
    }

    return next.handle().pipe(
      tap(() => {
        if (log) {
          this.logger.log(`STOP: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url}`);
        }
      }),
    );
  }
}
