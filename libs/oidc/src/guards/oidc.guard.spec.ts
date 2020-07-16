import { OIDCGuard } from './oidc.guard';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/nestjs-testing';
import * as cookie from 'cookie';
import { Response } from 'express';
import { SESSION_STATE_COOKIE } from '../oidc.constants';

AuthGuard('oidc').prototype.canActivate = jest
  .fn()
  .mockImplementation(() => true);

AuthGuard('oidc').prototype.logIn = jest.fn().mockImplementation(() => true);

describe('OIDCGuard', () => {
  let guard: OIDCGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OIDCGuard],
    }).compile();

    guard = module.get<OIDCGuard>(OIDCGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true', async () => {
      expect(
        await guard.canActivate(createMock<ExecutionContext>()),
      ).toBeTruthy();
    });

    it('should return and have options setup', async () => {
      const context = createMock<ExecutionContext>();
      const request = {
        headers: {
          cookie: cookie.serialize(SESSION_STATE_COOKIE, 'logged out'),
        },
      };

      const httpContext = {
        getRequest() {
          return request;
        },
        getResponse() {
          return createMock<Response>();
        },
      };

      jest.spyOn(context, 'switchToHttp').mockReturnValue(httpContext as any);

      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBeTruthy();
    });
  });
});
