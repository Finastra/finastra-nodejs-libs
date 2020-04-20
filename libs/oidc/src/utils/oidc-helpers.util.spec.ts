import { getTokenStore, OidcHelpers } from './oidc-helpers.util';
import { Issuer, Client } from 'openid-client';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS, MOCK_ISSUER } from '../mocks';

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
      );
      expect(helpers).toBeDefined();
    });
  });
});
