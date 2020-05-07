// This is a workaround until @Args work in @ResolveField
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const FieldsArgs = createParamDecorator(
  (resolver: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return getArgsFromQuery(ctx.getContext().req.body.query, resolver);
  },
);

export function getArgsFromQuery(query: string, resolver: string) {
  const matches = new RegExp(`${resolver}\((.*)\)`, 'g').exec(query);
  if (!matches) return [];

  const argsArray = matches[1].replace(/[\(\)\{\s"]/g, '').split(/[:,]/);
  const args = {};
  argsArray.forEach((value, index) => {
    if (index % 2 !== 0) {
      args[argsArray[index - 1]] = value;
    }
  });
  return args;
}
