import { UserinfoResponse } from 'openid-client';

export type UserInfo = {
  id?: string;
  tenant?: string;
  username?: string;
  isAuthenticated: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenEndpoint: string;
  expiresAt: number;
};

export type OidcUser = {
  id_token?: string;
  userinfo?: UserInfo | UserinfoResponse;
  authTokens?: AuthTokens;

  [key: string]: any;
};
