import { createMock } from '@golevelup/nestjs-testing';
import { getArgsFromQuery, FieldsArgs } from './fields-args.decorator';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

const sampleQuery = `accountsBalance(accountType: CURRENT, equivalentCurrency: "EUR", fromDate: "2018-01-03", toDate: "2020-03-05") {
    _meta {
      itemCount
    }
  }
`;

export function getParamDecoratorFactory(decorator: Function) {
  class Test {
    public test(@decorator() value) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('FieldArgs decorator', () => {
  it('should decorate', () => {
    const factory = getParamDecoratorFactory(FieldsArgs);
    const mockArgs = {};
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
      createMock<GqlExecutionContext>({
        getContext: () => ({
          req: {
            body: {},
          },
        }),
      }),
    );
    const result = factory('', createMock<ExecutionContext>());

    expect(result).toStrictEqual(mockArgs);
  });
});

describe('getArgsFromQuery', () => {
  it('should return args from a GraphQL query', () => {
    const args = {
      accountType: 'CURRENT',
      equivalentCurrency: 'EUR',
      fromDate: '2018-01-03',
      toDate: '2020-03-05',
    };
    expect(getArgsFromQuery(sampleQuery, 'accountsBalance')).toStrictEqual(args);
  });

  it('should return nothing if bad resolver', () => {
    const args = {};
    expect(getArgsFromQuery(sampleQuery, 'badResolver')).toStrictEqual(args);
  });
});
