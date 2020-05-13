import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getParamDecoratorFactory } from './fields-args.decorator.spec';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('should decorate', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = {};
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
      createMock<GqlExecutionContext>({
        getContext: () => ({
          req: {
            user: mockUser,
          },
        }),
      }),
    );
    const result = factory('', createMock<ExecutionContext>());

    expect(result).toStrictEqual(mockUser);
  });
});
