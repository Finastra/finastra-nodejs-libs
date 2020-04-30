import { createMock } from '@golevelup/nestjs-testing';
import { OidcStrategy } from './oidc.strategy';
import { TokenSet } from 'openid-client';
import { OidcHelpers } from '../utils';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS, MOCK_CLIENT_INSTANCE } from '../mocks';
import { JwtService } from '@nestjs/jwt';
import { UserInfoMethod } from '../interfaces';

const keyStore = new JWKS.KeyStore([]);
const MockOidcHelpers = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
);

describe('OidcStrategy', () => {
  let jwtService;
  let strategy;
  beforeEach(() => {
    jwtService = createMock<JwtService>();
    strategy = new OidcStrategy(jwtService, MockOidcHelpers);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return true', async () => {
      const spy = (jest.spyOn(
        MockOidcHelpers.client,
        'userinfo' as never,
      ) as any).mockReturnValue(true);
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });

    it('should catch errors', async () => {
      const spy = (jest.spyOn(
        MockOidcHelpers.client,
        'userinfo' as never,
      ) as any).mockImplementation(() => {
        throw new Error();
      });
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });
  });
});

describe('OidcStrategy with token userInfo method', () => {
  let jwtService;
  let strategy;
  beforeEach(() => {
    jwtService = createMock<JwtService>();
    let helpers = { ...MockOidcHelpers };
    helpers.config.userInfoMethod = UserInfoMethod.token;
    strategy = new OidcStrategy(jwtService, helpers);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should call decode token', async () => {
      const spy = jest
        .spyOn(jwtService, 'decode')
        .mockReturnValue({ username: 'test-user' });
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });

    it('should return decode token', async () => {
      const spy = jest
        .spyOn(jwtService, 'decode')
        .mockReturnValue({ name: 'User' });
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });
  });
});
