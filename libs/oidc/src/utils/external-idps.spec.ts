import { Issuer } from 'openid-client';
import axios from 'axios';
import { authenticateExternalIdps } from './external-idps';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS } from '../mocks';

const keyStore = new JWKS.KeyStore([]);

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
    const result = await authenticateExternalIdps(MOCK_OIDC_MODULE_OPTIONS.externalIdps);
    expect(result).toStrictEqual(MOCK_OIDC_MODULE_OPTIONS.externalIdps);
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

    const result = await authenticateExternalIdps(MOCK_OIDC_MODULE_OPTIONS.externalIdps);
    expect(result['idpTest'].expiresAt).toBeTruthy();
  });

  it('should return empty tokens', async () => {
    jest.spyOn(Issuer, 'discover').mockReturnValue(Promise.reject());
    const result = await authenticateExternalIdps(MOCK_OIDC_MODULE_OPTIONS.externalIdps);
    expect(result).toBeUndefined();
  });

  it('should return empty if no externalIdps', async () => {
    const result = await authenticateExternalIdps(null);
    expect(result).toBeUndefined();
  });
});
