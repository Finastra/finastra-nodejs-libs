import { createMock } from '@golevelup/nestjs-testing';
import { JWKS } from 'jose';
import { TokenSet } from 'openid-client';
import { MOCK_CLIENT_INSTANCE, MOCK_OIDC_MODULE_OPTIONS, MOCK_TRUST_ISSUER } from '../mocks';
import { OidcService, SSRPagesService } from '../services';
import { OidcStrategy } from './oidc.strategy';

const utils = require('../utils');

jest.mock('../utils');

describe('OidcStrategy', () => {
  let strategy;

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
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return true', async () => {
      jest.spyOn(utils, 'getUserInfo').mockImplementation(() => {
        return {
          username: 'John Doe',
          groups: [],
        };
      });
      utils.authenticateExternalIdps = jest.fn().mockReturnValue({});
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
    });

    it('should contain an expiration when given a token', async () => {
      jest.spyOn(utils, 'getUserInfo').mockImplementation(() => {
        return {
          username: 'John Doe',
          groups: [],
        };
      });

      const tokenset = createMock<TokenSet>();
      tokenset.expires_in = null;

      utils.authenticateExternalIdps = jest.fn().mockReturnValue({});
      const result = await strategy.validate(tokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt).toBeNull();
    });

    it('should contain an expiration when given a token with expires_at', async () => {
      jest.spyOn(utils, 'getUserInfo').mockImplementation(() => {
        return {
          username: 'John Doe',
          groups: [],
        };
      });
      const tokenset = createMock<TokenSet>();
      tokenset.expires_at = 1;

      utils.authenticateExternalIdps = jest.fn().mockReturnValue({});
      const result = await strategy.validate(tokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt).toBe(1);
    });

    it('should contain an expiration when given a token with expires_in', async () => {
      jest.spyOn(utils, 'getUserInfo').mockImplementation(() => {
        return {
          username: 'John Doe',
          groups: [],
        };
      });
      const tokenset = createMock<TokenSet>();
      tokenset.expires_in = 1;

      utils.authenticateExternalIdps = jest.fn().mockReturnValue({});
      const result = await strategy.validate(tokenset);
      expect(result).toBeTruthy();
      expect(result.authTokens.expiresAt > Date.now() / 1000).toBeTruthy();
    });
  });
});
