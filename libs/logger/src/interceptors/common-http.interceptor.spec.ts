import { createMock } from '@golevelup/nestjs-testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { HttpLoggingInterceptor } from './common-http.interceptor';

describe('HttpLoggingInterceptor', () => {
  let interceptor;
  let configService;

  beforeEach(() => {
    configService = new ConfigService();
    interceptor = new HttpLoggingInterceptor(configService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('#intercept', () => {
    it('should log if request is http', done => {
      const mockExecutionContext = createMock<ExecutionContext>();
      const mockHandler = createMock<CallHandler>();

      jest.spyOn(mockHandler, 'handle').mockReturnValue(of(null));
      const spy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(mockExecutionContext, mockHandler).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('should not log if request context is graphQL', done => {
      const mockExecutionContext = createMock<ExecutionContext>();
      const mockHandler = createMock<CallHandler>();

      mockExecutionContext['contextType'] = 'graphql';

      jest.spyOn(mockHandler, 'handle').mockReturnValue(of(null));
      const spy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(mockExecutionContext, mockHandler).subscribe(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
