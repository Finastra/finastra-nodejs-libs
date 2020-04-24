import { OidcModuleOptions } from './interfaces';
import { Issuer } from 'openid-client';

export const MOCK_ISSUER = 'http://issuer.io';
export const CLIENT_ID = '123';

export const MOCK_ISSUER_INSTANCE = new Issuer({ issuer: MOCK_ISSUER });
export const MOCK_CLIENT_INSTANCE = new MOCK_ISSUER_INSTANCE.Client({
  client_id: CLIENT_ID,
});

export const MOCK_OIDC_MODULE_OPTIONS: OidcModuleOptions = {
  issuer: MOCK_ISSUER,
  clientMetadata: {
    client_id: CLIENT_ID,
    client_secret: '456',
  },
  authParams: {
    scopes: 'oidc profile',
  },
  origin: 'bla',
};
