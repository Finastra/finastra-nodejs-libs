export const OIDC_MODULE_OPTIONS = 'OidcModuleOptions';
export const TOKEN_STORE = 'TokenStore';
export const defaultModuleOptions = {
  authParams: {
    clockTolerance: 10,
  },
  idleTime: 30,
  userInfoMethod: 'token',
};
export const SESSION_STATE_COOKIE = 'SESSION_STATE';
