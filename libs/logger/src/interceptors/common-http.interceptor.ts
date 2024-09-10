import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  readonly logger = new Logger(HttpLoggingInterceptor.name);
  #instanceID: string;

  constructor(private configService: ConfigService) {
    this.#instanceID = configService.get('SERVER_INSTANCE_ID');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let req = context.switchToHttp().getRequest();
    let log = false;

    if (context['contextType'] !== 'graphql') {
      log = true;
      this.logger.log(`START: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url} instanceID: ${this.#instanceID}`);
    }

    return next.handle().pipe(
      tap(() => {
        if (log) {
          this.logger.log(`STOP: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url} instanceID: ${this.#instanceID}`);
        }
      }),
    );
  }
}
