import { Logger } from '@nestjs/common';
import { UserInfoMethod } from '../interfaces';
import { OidcHelpers } from './oidc-helpers.util';
import { JWT } from 'jose';

const logger = new Logger('UserInfo');

export async function getUserInfo(token: string, oidcHelpers: OidcHelpers) {
  let userInfoData = await (oidcHelpers.config.userInfoMethod ===
  UserInfoMethod.token
    ? userInfo(token)
    : userInfoRemote(token, oidcHelpers));
  if (oidcHelpers.config.userInfoCallback) {
    userInfoData = {
      ...userInfoData,
      ...(await oidcHelpers.config.userInfoCallback(
        userInfoData.username,
        oidcHelpers.config.externalIdps,
      )),
    };
  }

  return userInfoData;
}

async function userInfoRemote(token: string, oidcHelpers: OidcHelpers) {
  try {
    return await oidcHelpers.client.userinfo(token);
  } catch (err) {
    const msg = `Error accessing user information`;
    logger.error(msg);
    return userInfo(token, 'sub');
  }
}

function userInfo(token: string, usernameParameter?: string) {
  const identity: any = JWT.decode(token);
  return {
    username: identity[usernameParameter] || identity.username || identity.name,
    tenant: identity.tenant,
  };
}
