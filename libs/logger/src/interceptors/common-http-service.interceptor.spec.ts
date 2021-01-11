import { createMock } from '@golevelup/nestjs-testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { of } from 'rxjs';
import { OMSLogger } from '../oms/oms.logger.service';
import { LoggingInterceptor } from './common-http-service.interceptor';

const interceptor = new LoggingInterceptor(new OMSLogger());

describe('CommonHTTPInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('#intercept', () => {
    it('t1', async done => {
      const mockExecutionContext = createMock<ExecutionContext>();
      const mockHandler = createMock<CallHandler>();

      jest.spyOn(mockHandler, 'handle').mockReturnValue(of(null));
      const spy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(mockExecutionContext, mockHandler).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('should intercept in graphQL context', async done => {
      const mockExecutionContext = createMock<ExecutionContext>();
      const mockHandler = createMock<CallHandler>();

      mockExecutionContext['contextType'] = 'graphql';

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
        createMock<GqlExecutionContext>({
          getContext: () => ({
            req: {},
          }),
        }),
      );

      jest.spyOn(mockHandler, 'handle').mockReturnValue(of(null));
      const spy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(mockExecutionContext, mockHandler).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });
  });
});
