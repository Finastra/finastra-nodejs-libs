import { UserinfoResponse } from 'openid-client';

export interface UserInfo {
  id?: string;
  tenant?: string;
  username?: string;
  email?: string;
  isGuest?: boolean;
  channel?: string;
};

export interface UserInfoMapping {
  id?: string;
  username?: string;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenEndpoint: string;
  expiresAt: number;
};

export interface OidcUser {
  id_token?: string;
  userinfo?: UserInfo | UserinfoResponse;
  authTokens?: AuthTokens;

  [key: string]: any;
};

export interface Identity {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  at_hash: string;
  name: string;
  given_name: string;
  family_name: string;
  acr: string;
  sid: string;
  app: string;
  org: string;
  amr: string[];
  tenant: string;
  username: string;
  email?: string;
}