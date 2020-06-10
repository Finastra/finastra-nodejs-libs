import { createMock } from '@golevelup/nestjs-testing';
import { OidcStrategy } from './oidc.strategy';
import { TokenSet } from 'openid-client';
import { OidcHelpers } from '../utils';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS, MOCK_CLIENT_INSTANCE } from '../mocks';

const keyStore = new JWKS.KeyStore([]);
const MockOidcHelpers = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
);

describe('OidcStrategy', () => {
  let strategy;
  beforeEach(() => {
    strategy = new OidcStrategy(MockOidcHelpers);
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
  });
});
