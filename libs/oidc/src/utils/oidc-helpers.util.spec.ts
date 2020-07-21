import {
  getTokenStore,
  OidcHelpers,
  isExpired,
  updateUserAuthToken,
} from './oidc-helpers.util';
import { Issuer, Client } from 'openid-client';
import { JWKS } from 'jose';
import {
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_ISSUER,
  MOCK_TRUST_ISSUER,
} from '../mocks';
import { createRequest } from 'node-mocks-http';

describe('OIDC Helpers', () => {
  describe('getTokenStore', () => {
    it('should call Issuer', () => {
      const spy = jest.spyOn(Issuer, 'discover').mockReturnValue(
        Promise.resolve({
          keystore: () => {},
        } as any),
      );
      getTokenStore(MOCK_ISSUER);
      expect(spy).toHaveBeenCalledWith(MOCK_ISSUER);
    });
  });

  describe('class', () => {
    it('should be defined', () => {
      const keyStore = new JWKS.KeyStore([]);
      const client = {} as Client;
      const helpers = new OidcHelpers(
        keyStore,
        client,
        MOCK_OIDC_MODULE_OPTIONS,
        MOCK_TRUST_ISSUER,
      );
      expect(helpers).toBeDefined();
    });
  });
});

describe('isExpired', () => {
  it('should return false if no expiredAt token', () => {
    expect(isExpired(null)).toBeFalsy();
  });
});

describe('updateUserAuthToken', () => {
  it('should do nothing if no item', () => {
    const req = createRequest();
    updateUserAuthToken([null], req);
    expect(req.hasOwnProperty('user')).toBeFalsy();
  });
});
