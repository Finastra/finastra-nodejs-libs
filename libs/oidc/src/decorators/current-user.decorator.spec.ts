import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { createRequest } from 'node-mocks-http';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class Test {
      public test(@decorator() value) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
  }

  it('should decorate', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = {
      id_token: 1,
    };

    const request = createRequest();
    const context = createMock<ExecutionContext>();
    const host = {
      getRequest: () => {
        return {
          ...request,
          user: { ...mockUser },
        };
      },
    } as HttpArgumentsHost;
    jest.spyOn(context, 'switchToHttp').mockReturnValue(host);

    const result = factory('', context);

    expect(result).toStrictEqual(mockUser);
  });
});
