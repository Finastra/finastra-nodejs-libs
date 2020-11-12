import { Logger } from '@nestjs/common';
import { UserInfo, UserInfoMethod } from '../interfaces';
import { JWT } from 'jose';
import { OidcService } from '../services';
import { UserinfoResponse } from 'openid-client';

const logger = new Logger('UserInfo');

export async function getUserInfo(
  token: string,
  oidcService: OidcService,
  idpKey: string,
): Promise<UserInfo | UserinfoResponse> {
  let userInfoData = await (oidcService.options.userInfoMethod === UserInfoMethod.token
    ? userInfo(token)
    : userInfoRemote(token, oidcService, idpKey));
  if (oidcService.options.userInfoCallback) {
    userInfoData = {
      ...userInfoData,
      ...(await oidcService.options.userInfoCallback(userInfoData.username, oidcService.options.externalIdps)),
    };
  }

  return userInfoData;
}

async function userInfoRemote(
  token: string,
  oidcService: OidcService,
  idpKey: string,
): Promise<UserInfo | UserinfoResponse> {
  try {
    return await oidcService.idpInfos[idpKey].client.userinfo(token);
  } catch (err) {
    const msg = `Error accessing user information`;
    logger.error(msg);
    return userInfo(token, 'sub', 'sub');
  }
}

function userInfo(token: string, idMapping?: string, usernameMapping?: string): UserInfo {
  const identity: any = JWT.decode(token);
  return {
    id: identity[idMapping] || identity.sub,
    username: identity[usernameMapping] || identity.name || identity.username,
    tenant: identity.tenant,
    isAuthenticated: true,
  };
}
