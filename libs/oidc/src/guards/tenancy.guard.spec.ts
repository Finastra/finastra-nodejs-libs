import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/nestjs-testing';
import { Reflector } from '@nestjs/core';
import { TenancyGuard } from './tenancy.guard';
import { OidcService } from '../services';
import { MockOidcService, MOCK_REQUEST } from '../mocks';
import { TestingModule, Test } from '@nestjs/testing';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ChannelType } from '..';

describe('TenancyGuard', () => {
  let guard: TenancyGuard;
  let reflector: Reflector;
  let oidcService: OidcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenancyGuard,
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

    guard = module.get<TenancyGuard>(TenancyGuard);
    reflector = module.get<Reflector>(Reflector);
    oidcService = module.get<OidcService>(OidcService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if isMultitenant decorator is not defined', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(undefined);
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({});
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should return true if the route tenancy and config tenancy are the same (true) for unauthenticated request', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = true;
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({});
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should return true if the route tenancy and config tenancy are the same (false) for unauthenticated request', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    oidcService.isMultitenant = false;
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({});
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should return true if single tenancy and authenticated user', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(false);
    oidcService.isMultitenant = false;
    const req = {
      ...MOCK_REQUEST,
    };
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue(req);
    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should throw not found exception if the route tenancy and config tenancy are not the same', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = false;
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({});
    expect(() => {
      guard.canActivate(context);
    }).toThrow();
  });

  it('should throw not found exception if user channel and channel in url are not the same', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = true;
    const req = {
      ...MOCK_REQUEST,
      params: {
        tenantId: 'tenant',
        channelType: 'b2e',
      },
    };
    req.user.userinfo['channel'] = 'b2c';
    req.user.userinfo['tenant'] = 'tenant';
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue(req);
    expect(() => {
      guard.canActivate(context);
    }).toThrow();
  });

  it('should throw not found exception if user tenant and tenant in url are not the same', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = true;
    const req = {
      ...MOCK_REQUEST,
      params: {
        tenantId: 'tenant',
        channelType: 'b2c',
      },
    };
    req.user.userinfo['channel'] = 'b2c';
    req.user.userinfo['tenant'] = 'tenant2';
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue(req);
    expect(() => {
      guard.canActivate(context);
    }).toThrow();
  });

  it('should throw not found exception if user got a channel but no tenant', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = true;
    const req = {
      ...MOCK_REQUEST,
      params: {
        tenantId: 'tenant',
        channelType: 'b2c',
      },
    };
    req.user.userinfo['channel'] = 'b2c';
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue(req);
    expect(() => {
      guard.canActivate(context);
    }).toThrow();
  });

  it('should return true if user tenant and channel and tenant and channel in url are the same', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = true;
    const req = {
      ...MOCK_REQUEST,
      params: {
        tenantId: 'tenant',
        channelType: 'b2c',
      },
    };
    req.user.userinfo['channel'] = 'b2c';
    req.user.userinfo['tenant'] = 'tenant';
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue(req);
    expect(() => {
      guard.canActivate(context);
    }).toBeTruthy();
  });

  it('should return true if user tenant and tenant in url are the same with channel defined in config', () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.options.channelType = ChannelType.b2e;
    const req = {
      ...MOCK_REQUEST,
      params: {
        tenantId: 'tenant',
      },
    };
    req.user.userinfo['tenant'] = 'tenant';
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue(req);
    expect(() => {
      guard.canActivate(context);
    }).toBeTruthy();
  });

  it('should handle graphQL context', async () => {
    jest.spyOn(guard['reflector'], 'get').mockReturnValue(true);
    oidcService.isMultitenant = true;
    const context = createMock<ExecutionContext>();
    context['contextType'] = 'graphql';

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(
      createMock<GqlExecutionContext>({
        getContext: () => ({
          req: {
            ...MOCK_REQUEST,
            params: {
              tenantId: 'tenant',
              channelType: 'b2c',
            },
          },
        }),
      }),
    );

    expect(await guard.canActivate(context)).toBeTruthy();
  });
});
