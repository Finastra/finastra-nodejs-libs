import { JWKS } from 'jose';
import { UserMiddleware } from './user.middleware';
import { OidcHelpers } from '../utils';
import { createMock } from '@golevelup/nestjs-testing';
import { Request, Response } from 'express';
import { MOCK_CLIENT_INSTANCE, MOCK_OIDC_MODULE_OPTIONS } from '../mocks';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

describe('User Middleware', () => {
  let middleware: UserMiddleware;
  const keyStore = new JWKS.KeyStore([]);
  const MockOidcHelpers = new OidcHelpers(
    keyStore,
    MOCK_CLIENT_INSTANCE,
    MOCK_OIDC_MODULE_OPTIONS,
  );

  class mockConfigService {
    get(value) {
      return value;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMiddleware,
        {
          provide: OidcHelpers,
          useValue: MockOidcHelpers,
        },
        {
          provide: ConfigService,
          useClass: mockConfigService,
        },
      ],
    }).compile();

    middleware = module.get<UserMiddleware>(UserMiddleware);
  });

  it('should add user in request', () => {
    const req = createMock<Request>();
    const res = createMock<Response>();
    const next = function() {};
    expect(middleware.use(req, res, next)).toBeTruthy();
  });
});
