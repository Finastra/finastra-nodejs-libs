import { createMock } from '@golevelup/nestjs-testing';
import { ConfigService } from '@nestjs/config';
import { JWKS } from 'jose';
import { TokenSet } from 'openid-client';
import { MOCK_CLIENT_INSTANCE, MOCK_OIDC_MODULE_OPTIONS, MOCK_TRUST_ISSUER } from '../mocks';
import { OidcService, SSRPagesService } from '../services';
import * as externalIdps from '../utils/external-idps';
import * as userInfo from '../utils/user-info';
import { OidcStrategy } from './oidc.strategy';

describe('OidcStrategy', () => {
  let strategy: OidcStrategy;
  let mockTokenset: TokenSet;

  beforeEach(() => {
    const mockOidcService = new OidcService(MOCK_OIDC_MODULE_OPTIONS, new ConfigService(), new SSRPagesService());
    const idpKey = 'idpKey';
    mockOidcService.idpInfos[idpKey] = {
      client: MOCK_CLIENT_INSTANCE,
      tokenStore: new JWKS.KeyStore([]),
      trustIssuer: MOCK_TRUST_ISSUER,
      strategy: null,
    };
    strategy = new OidcStrategy(mockOidcService, idpKey);

    mockTokenset = createMock<TokenSet>();
    mockTokenset.access_token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

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
      const result = await strategy.validate(mockTokenset);
      expect(result).toBeTruthy();
    });

    it('should contain an expiration when given a token', async () => {
      mockTokenset.expires_in = null;

      const result = await strategy.validate(mockTokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt).toBeNull();
    });

    it('should contain an expiration when given a token with expires_at', async () => {
      mockTokenset.expires_at = 1;

      const result = await strategy.validate(mockTokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt).toBe(1);
    });

    it('should contain an expiration when given a token with expires_in', async () => {
      mockTokenset.expires_in = 1;

      const result = await strategy.validate(mockTokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt > Date.now() / 1000).toBeTruthy();
    });
  });
});
