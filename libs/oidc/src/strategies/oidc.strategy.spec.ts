import { createMock } from '@golevelup/nestjs-testing';
import { JWKS } from 'jose';
import { TokenSet } from 'openid-client';
import { MOCK_CLIENT_INSTANCE, MOCK_OIDC_MODULE_OPTIONS, MOCK_TRUST_ISSUER } from '../mocks';
import { OidcService, SSRPagesService } from '../services';
import * as externalIdps from '../utils/external-idps';
import * as userInfo from '../utils/user-info';
import { OidcStrategy } from './oidc.strategy';

describe('OidcStrategy', () => {
  let strategy: OidcStrategy;

  beforeEach(() => {
    const mockOidcService = new OidcService(MOCK_OIDC_MODULE_OPTIONS, new SSRPagesService());
    const idpKey = 'idpKey';
    mockOidcService.idpInfos[idpKey] = {
      client: MOCK_CLIENT_INSTANCE,
      tokenStore: new JWKS.KeyStore([]),
      trustIssuer: MOCK_TRUST_ISSUER,
      strategy: null,
    };
    strategy = new OidcStrategy(mockOidcService, idpKey);

    jest.spyOn(userInfo, 'getUserInfo').mockImplementation(() => {
      return {
        username: 'John Doe',
        groups: [],
      } as any;
    });

    jest.spyOn(externalIdps, 'authenticateExternalIdps').mockReturnValue({} as any);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return true', async () => {
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
    });

    it('should contain an expiration when given a token', async () => {
      const tokenset = createMock<TokenSet>();
      tokenset.expires_in = null;

      const result = await strategy.validate(tokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt).toBeNull();
    });

    it('should contain an expiration when given a token with expires_at', async () => {
      const tokenset = createMock<TokenSet>();
      tokenset.expires_at = 1;

      const result = await strategy.validate(tokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt).toBe(1);
    });

    it('should contain an expiration when given a token with expires_in', async () => {
      const tokenset = createMock<TokenSet>();
      tokenset.expires_in = 1;

      const result = await strategy.validate(tokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt > Date.now() / 1000).toBeTruthy();
    });
  });
});
