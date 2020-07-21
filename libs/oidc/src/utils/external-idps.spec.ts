import { Issuer } from 'openid-client';
import axios from 'axios';
import { authenticateExternalIdps } from './external-idps';
import { OidcHelpers } from './oidc-helpers.util';
import { JWKS } from 'jose';
import {
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_TRUST_ISSUER,
} from '../mocks';

const keyStore = new JWKS.KeyStore([]);
const MockOidcHelpers = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_TRUST_ISSUER,
);

describe('authenticateExternalIdps', () => {
  it('should return tokens', async () => {
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
    const result = await authenticateExternalIdps(MockOidcHelpers);
    expect(result).toStrictEqual(MockOidcHelpers.config.externalIdps);
  });

  it('should return tokens when expires_in', async () => {
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
          expires_in: 300,
        },
      }),
    );

    const result = await authenticateExternalIdps(MockOidcHelpers);
    expect(result['idpTest'].expiresAt).toBeTruthy();
  });

  it('should return empty tokens', async () => {
    jest.spyOn(Issuer, 'discover').mockReturnValue(Promise.reject());
    const result = await authenticateExternalIdps(MockOidcHelpers);
    expect(result).toBeUndefined();
  });

  it('should return empty if no externalIdps', async () => {
    MockOidcHelpers.config.externalIdps = null;
    const result = await authenticateExternalIdps(MockOidcHelpers);
    expect(result).toBeUndefined();
    MockOidcHelpers.config.externalIdps = MOCK_OIDC_MODULE_OPTIONS.externalIdps;
  });
});
