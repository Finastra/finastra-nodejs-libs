import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {
    this.logger.setContext('http');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const reqPromise = new Promise<Request>(resolve => {
      let req = context.switchToHttp().getRequest();
      if (context['contextType'] === 'graphql') {
        import('@nestjs/graphql').then(module => {
          resolve(module.GqlExecutionContext.create(context).getContext().req);
        });
      } else {
        resolve(req);
      }
    });
    const req$ = from(reqPromise);

    return req$.pipe(
      tap(req =>
        this.logger.log(`START: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url}`),
      ),
      switchMap(req => {
        return next
          .handle()
          .pipe(
            tap(() =>
              this.logger.log(
                `STOP: ${context.getClass().name}.${context.getHandler().name}(): ${req.method} ${req.url}`,
              ),
            ),
          );
      }),
    );
  }
}
