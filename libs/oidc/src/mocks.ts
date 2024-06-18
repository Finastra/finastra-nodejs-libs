import { Client, Issuer } from 'openid-client';
import { OidcModuleOptions, UserInfoMethod } from './interfaces';

export const MOCK_ISSUER = 'http://issuer.io';
export const CLIENT_ID = '123';

export const MOCK_ISSUER_INSTANCE = new Issuer({ issuer: MOCK_ISSUER });
export const MOCK_CLIENT_INSTANCE = new MOCK_ISSUER_INSTANCE.Client({
  client_id: CLIENT_ID,
});
export const MOCK_TRUST_ISSUER = {
  metadata: {
    token_endpoint: '/token',
    end_session_endpoint: '/end_session',
  },
} as Issuer<Client>;

export const MOCK_OIDC_MODULE_OPTIONS: OidcModuleOptions = {
  issuer: MOCK_ISSUER,
  clientMetadata: {
    client_id: CLIENT_ID,
    client_secret: '456',
  },
  authParams: {
    scope: 'oidc profile',
  },
  defaultHttpOptions: {
    timeout: 40000,
  },
  origin: 'bla',
  userInfoMethod: UserInfoMethod.token,
  externalIdps: {
    idpTest: {
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      issuer: 'http://issuer',
      scope: 'openid',
    },
  },
};

export const MockOidcService = {
  options: {},

  login: (req, res, next, params) => {},

  logout: (req, res, params) => {},

  checkToken: (req, res) => {},

  refreshTokens: (req, res) => {},

  loggedOut: (res, params) => {},

  tenantSwitchWarn: (res, params) => {},

  isExpired: () => {},

  createStrategy: () => {
    return Promise.resolve({});
  },

  getTokenStoreKey: () => {
    return 'tenant.b2c';
  },

  updateSessionDuration: req => {},

  updateUserAuthToken: (data, req) => {},

  requestTokenRefresh: authTokens => {},
};

export const MOCK_REQUEST = {
  user: {
    userinfo: {
      username: 'username',
      groups: ['test-user'],
    },
  },
};
