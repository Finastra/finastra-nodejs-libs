import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/nestjs-testing';
import { TokenGuard } from './token.guard';
import { Reflector } from '@nestjs/core';
import { JWT, JWK } from 'jose';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('OIDCGuard', () => {
  let guard: TokenGuard;
  let token: string;

  beforeEach(() => {
    const key = JWK.asKey({
      kty: 'oct',
      k: 'hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg',
    });

    const payload = {
      'urn:example:claim': 'foo',
    };

    token = JWT.sign(payload, key, {
      audience: ['urn:example:client'],
      issuer: 'https://op.example.com',
      expiresIn: '2 hours',
      header: {
        typ: 'JWT',
      },
    });
    guard = new TokenGuard(createMock<Reflector>());
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if public', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    const context = createMock<ExecutionContext>();
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should return true with auth', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      user: {
        username: 'test',
      },
      isAuthenticated: () => true,
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should throw unauthorized error without auth', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      headers: {},
      isAuthenticated: () => false,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should handle graphQL context', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();
    context['contextType'] = 'graphql';

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
      createMock<GqlExecutionContext>({
        getContext: () => ({
          req: {
            isAuthenticated: () => false,
          },
        }),
      }),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
      createMock<GqlExecutionContext>({
        getContext: () => ({
          req: {
            isAuthenticated: () => true,
          },
        }),
      }),
    );

    expect(await guard.canActivate(context)).toBe(true);
  });
});
