import { createMock } from '@golevelup/nestjs-testing';
import { OidcStrategy } from './oidc.strategy';
import { TokenSet, Client, Issuer } from 'openid-client';
import { OidcHelpers } from '../utils';
import { JWKS } from 'jose';
import {
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_CLIENT_INSTANCE,
  MOCK_TRUST_ISSUER,
} from '../mocks';

const utils = require('../utils');
const keyStore = new JWKS.KeyStore([]);
const MockOidcHelpers = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_TRUST_ISSUER,
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
      utils.getUserInfo = jest.fn().mockImplementation(() => {
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
      utils.getUserInfo = jest.fn().mockImplementation(() => {
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
      expect(
        result.authTokens.master.expiresAt > Date.now() / 1000,
      ).toBeTruthy();
    });

    it('should contain an expiration when given a token with expires_at', async () => {
      utils.getUserInfo = jest.fn().mockImplementation(() => {
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
      expect(result.authTokens.master.expiresAt).toBe(1);
    });

    it('should contain an expiration when given a token with expires_in', async () => {
      utils.getUserInfo = jest.fn().mockImplementation(() => {
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
      expect(
        result.authTokens.master.expiresAt > Date.now() / 1000,
      ).toBeTruthy();
    });
  });
});
