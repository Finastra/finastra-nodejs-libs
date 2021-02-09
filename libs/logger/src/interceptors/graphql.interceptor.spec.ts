import { createMock } from '@golevelup/nestjs-testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { of } from 'rxjs';
import { GraphQLLoggingInterceptor } from './graphql.interceptor';

describe('GraphQLLoggingInterceptor', () => {
  let interceptor;

  beforeEach(() => {
    interceptor = new GraphQLLoggingInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('#intercept', () => {
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

    it('should intercept in graphQL context', async done => {
      const mockExecutionContext = createMock<ExecutionContext>();
      const mockHandler = createMock<CallHandler>();

      jest.spyOn(mockHandler, 'handle').mockReturnValue(of(null));
      const spy = jest.spyOn(interceptor['logger'], 'log');

      interceptor.intercept(mockExecutionContext, mockHandler).subscribe(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
