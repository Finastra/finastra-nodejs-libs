import { OidcModuleOptions } from './interfaces';

export const MOCK_ISSUER = 'http://issuer.io';

export const MOCK_OIDC_MODULE_OPTIONS: OidcModuleOptions = {
  clientId: '123',
  clientSecret: '456',
  issuer: MOCK_ISSUER,
  redirectUriLogin: 'bla',
  redirectUriLogout: 'bla',
  scopes: 'oidc profile',
};
