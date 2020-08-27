import { Logger } from '@nestjs/common';
import { UserInfoMethod } from '../interfaces';
import { JWT } from 'jose';
import { OidcService } from '../services';

const logger = new Logger('UserInfo');

export async function getUserInfo(token: string, oidcService: OidcService) {
  let userInfoData = await (oidcService.options.userInfoMethod ===
  UserInfoMethod.token
    ? userInfo(token)
    : userInfoRemote(token, oidcService));
  if (oidcService.options.userInfoCallback) {
    userInfoData = {
      ...userInfoData,
      ...(await oidcService.options.userInfoCallback(
        userInfoData.username,
        oidcService.options.externalIdps,
      )),
    };
  }

  return userInfoData;
}

async function userInfoRemote(token: string, oidcService: OidcService) {
  try {
    return await oidcService.client.userinfo(token);
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
