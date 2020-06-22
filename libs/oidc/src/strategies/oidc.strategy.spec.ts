import { createMock } from '@golevelup/nestjs-testing';
import { OidcStrategy } from './oidc.strategy';
import { TokenSet, Issuer } from 'openid-client';
import { OidcHelpers } from '../utils';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS, MOCK_CLIENT_INSTANCE } from '../mocks';
import axios from 'axios';

const utils = require('../utils');
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
      utils.getUserInfo = jest.fn().mockImplementation(() => {
        return {
          username: 'John Doe',
          groups: [],
        };
      });
      jest.spyOn(strategy, 'authenticateExternalIdps').mockReturnValue([]);
      const result = await strategy.validate(createMock<TokenSet>());
      expect(result).toBeTruthy();
    });
  });

  describe('authenticateExternalIdps', () => {
    it('should return tokens array', async () => {
      jest.spyOn(Issuer, 'discover').mockReturnValue(
        Promise.resolve({
          keystore: () => {},
          metadata: {
            token_endpoint: 'http://token_endpoint',
          },
        } as any),
      );
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          data: {
            access_token: 'access_token',
          },
        }),
      );
      const result = await strategy.authenticateExternalIdps();
      let res = {};
      res[MOCK_OIDC_MODULE_OPTIONS.externalIdps[0].issuer] = 'access_token';
      expect(result).toStrictEqual(res);
    });
  });
});
