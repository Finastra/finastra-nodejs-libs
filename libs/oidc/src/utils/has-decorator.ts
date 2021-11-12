import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export function hasDecorator(decorator: string, context: ExecutionContext, reflector: Reflector): boolean {
  const classDecorator = reflector.get<boolean>(decorator, context.getClass());
  const handlerDecorator = reflector.get<boolean>(decorator, context.getHandler());
  const hasDecorator = typeof classDecorator !== 'undefined' ? classDecorator : handlerDecorator;
  return hasDecorator;
}
