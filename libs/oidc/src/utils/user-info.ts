import { UnauthorizedException, Logger } from '@nestjs/common';
import { UserInfoMethod } from '../interfaces';
import { OidcStrategyOptions } from './oidc-helpers.util';
import { JWT } from 'jose';

const logger = new Logger('UserInfo');

export async function getUserInfo(
  accessToken: string,
  oidcHelpers: OidcStrategyOptions,
) {
  let userInfoData = await (oidcHelpers.config.userInfoMethod ===
  UserInfoMethod.token
    ? userInfo(accessToken)
    : userInfoRemote(accessToken, oidcHelpers));
  if (oidcHelpers.config.userInfoCallback) {
    userInfoData = {
      ...userInfoData,
      ...(await oidcHelpers.config.userInfoCallback(userInfoData.username)),
    };
  }

  return userInfoData;
}

async function userInfoRemote(
  accessToken: string,
  oidcHelpers: OidcStrategyOptions,
) {
  try {
    return await oidcHelpers.client.userinfo(accessToken);
  } catch (err) {
    const msg = `Error accessing user information`;
    logger.error(msg);
    return userInfo(accessToken, 'sub');
  }
}

function userInfo(accessToken: string, usernameParameter?: string) {
  const identity: any = JWT.decode(accessToken);
  return {
    username: identity[usernameParameter] || identity.username || identity.name,
  };
}
