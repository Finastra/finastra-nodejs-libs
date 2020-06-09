import { getUserInfo } from './user-info';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS, MOCK_CLIENT_INSTANCE } from '../mocks';
import { UserInfoMethod } from '../interfaces';
import { OidcHelpers } from './oidc-helpers.util';

const keyStore = new JWKS.KeyStore([]);
const MOCK_OIDC_HELPERS = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
);

const MOCK_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('getUserInfo', () => {
  let helpers = { ...MOCK_OIDC_HELPERS };
  it('should return user info with token user info method', async () => {
    helpers.config.userInfoMethod = UserInfoMethod.token;
    helpers.config.userInfoCallback = userId => {
      return {
        username: userId,
        groups: ['admin'],
      };
    };
    expect(await getUserInfo(MOCK_ACCESS_TOKEN, helpers)).toEqual({
      username: 'John Doe',
      groups: ['admin'],
    });
  });

  it('should return user info with remote user info method', async () => {
    let helpers = { ...MOCK_OIDC_HELPERS };
    helpers.config.userInfoMethod = UserInfoMethod.endpoint;
    helpers.client.userinfo = () => {
      return new Promise((resolve, reject) =>
        resolve({
          sub: 'John Doe',
          username: 'John Doe',
        }),
      );
    };
    helpers.config.userInfoCallback = userId => {
      return {
        username: userId,
        groups: ['admin'],
      };
    };
    expect(await getUserInfo(MOCK_ACCESS_TOKEN, helpers)).toEqual({
      username: 'John Doe',
      sub: 'John Doe',
      groups: ['admin'],
    });
  });
});