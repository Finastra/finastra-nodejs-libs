import { getUserInfo } from './user-info';
import { JWKS } from 'jose';
import { MOCK_OIDC_MODULE_OPTIONS, MOCK_CLIENT_INSTANCE, MOCK_TRUST_ISSUER } from '../mocks';
import { UserInfoMethod } from '../interfaces';
import { OidcService } from '../services';

describe('OidcStrategy', () => {
  const MOCK_ACCESS_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const idpKey = 'idpKey';
  let service;
  beforeEach(() => {
    service = new OidcService(MOCK_OIDC_MODULE_OPTIONS);
    service.idpInfos[idpKey] = {
      client: MOCK_CLIENT_INSTANCE,
      tokenStore: new JWKS.KeyStore([]),
      trustIssuer: MOCK_TRUST_ISSUER,
    };
  });

  describe('getUserInfo', () => {
    it('should return user info with token user info method', async () => {
      service.options.userInfoMethod = UserInfoMethod.token;
      service.options.userInfoCallback = userId => {
        return {
          username: userId,
          groups: ['admin'],
        };
      };
      expect(await getUserInfo(MOCK_ACCESS_TOKEN, service, idpKey)).toEqual(
        expect.objectContaining({
          username: 'John Doe',
          groups: ['admin'],
        }),
      );
    });

    it('should return user info with remote user info method', async () => {
      service.options.userInfoMethod = UserInfoMethod.endpoint;
      service.idpInfos[idpKey].client.userinfo = () => {
        return new Promise((resolve, reject) =>
          resolve({
            sub: 'John Doe',
            username: 'John Doe',
          }),
        );
      };
      service.options.userInfoCallback = userId => {
        return {
          username: userId,
          groups: ['admin'],
        };
      };
      expect(await getUserInfo(MOCK_ACCESS_TOKEN, service, idpKey)).toEqual({
        username: 'John Doe',
        sub: 'John Doe',
        groups: ['admin'],
      });
    });

    it('should put sub in username if user info endpoint call failed', async () => {
      service.options.userInfoMethod = UserInfoMethod.endpoint;
      service.options.userInfoCallback = null;
      service.idpInfos[idpKey].client.userinfo = () => {
        return new Promise((resolve, reject) => reject('no user info'));
      };
      expect(await getUserInfo(MOCK_ACCESS_TOKEN, service, idpKey)).toEqual(
        expect.objectContaining({
          username: '1234567890',
        }),
      );
    });
  });
});
