import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { JWK, JWT } from 'jose';
import { MockOidcService } from '../mocks';
import { OidcService } from '../services';
import { GuestTokenGuard } from './guest-token.guard';

describe('OIDCGuard', () => {
  let guard: GuestTokenGuard;
  let token: string;
  let reflector: Reflector;
  let oidcService: OidcService;

  beforeEach(async () => {
    const key = JWK.asKey({
      kty: 'oct',
      k: 'hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg',
    });

    const payload = {
      'urn:example:claim': 'foo',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestTokenGuard,
        {
          provide: Reflector,
          useValue: createMock<Reflector>(),
        },
        {
          provide: OidcService,
          useValue: MockOidcService,
        },
      ],
    }).compile();

    token = JWT.sign(payload, key, {
      audience: ['urn:example:client'],
      issuer: 'https://op.example.com',
      expiresIn: '2 hours',
      header: {
        typ: 'JWT',
      },
    });
    guard = module.get<GuestTokenGuard>(GuestTokenGuard);
    reflector = module.get<Reflector>(Reflector);
    oidcService = module.get<OidcService>(OidcService);
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
        authTokens: {
          expiresAt: Date.now() + 10000,
        },
      },
      params: {},
      isAuthenticated: () => true,
    });
    jest.spyOn(oidcService, 'isExpired').mockReturnValue(false);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true with unexpired token', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      user: {
        username: 'test',
        authTokens: {
          expiresAt: Date.now() - 10,
        },
      },
      url: '/test/b2c/refresh-token',
      params: { tenantId: 'test', channelType: 'b2c' },
      isAuthenticated: () => true,
    });
    jest.spyOn(oidcService, 'isExpired').mockReturnValue(false);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true with expired token after a refresh', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      user: {
        username: 'test',
        authTokens: {
          expiresAt: Date.now() - 10,
        },
      },
      url: '/test/b2c/refresh-token',
      params: { tenantId: 'test', channelType: 'b2c' },
      isAuthenticated: () => true,
    });
    jest.spyOn(oidcService, 'isExpired').mockReturnValue(true);
    jest
      .spyOn(oidcService, 'requestTokenRefresh')
      .mockResolvedValueOnce({ accessToken: '', refreshToken: '', expiresAt: Date.now() + 1800 });

    const spyUpdateUserAuthToken = jest.spyOn(oidcService, 'updateUserAuthToken');
    const spyUpdateSessionDuration = jest.spyOn(oidcService, 'updateSessionDuration');
    expect(await guard.canActivate(context)).toBeTruthy();
    expect(spyUpdateUserAuthToken).toHaveBeenCalled();
    expect(spyUpdateSessionDuration).toHaveBeenCalled();
  });

  it('should throw error with expired token', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      user: {
        username: 'test',
        authTokens: {
          expiresAt: Date.now() - 10,
        },
      },
      url: '/test/b2c/',
      params: { tenantId: 'test', channelType: 'b2c' },
      isAuthenticated: () => true,
    });
    jest.spyOn(oidcService, 'isExpired').mockReturnValue(true);
    jest.spyOn(oidcService, 'requestTokenRefresh').mockRejectedValue('error');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw unauthorized error without auth', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      headers: {},
      isAuthenticated: () => false,
      params: {},
    });

    // TODO: add test case
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

    // TODO: add test case

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
      createMock<GqlExecutionContext>({
        getContext: () => ({
          req: {
            isAuthenticated: () => true,
            user: {
              username: 'test',
              authTokens: {
                expiresAt: Date.now() + 10000,
              },
              url: '/',
              params: {},
            },
          },
        }),
      }),
    );
    jest.spyOn(oidcService, 'isExpired').mockReturnValue(false);

    expect(await guard.canActivate(context)).toBe(true);
  });
});
