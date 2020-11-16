import { Logger } from '@nestjs/common';
import { JWT } from 'jose';
import { UserinfoResponse } from 'openid-client';
import { UserInfo, UserInfoMapping, UserInfoMethod } from '../interfaces';
import { OidcService } from '../services';

const logger = new Logger('UserInfo');

export async function getUserInfo(
  token: string,
  oidcService: OidcService,
  idpKey: string,
): Promise<UserInfo | UserinfoResponse> {
  let userInfoData = await (oidcService.options.userInfoMethod === UserInfoMethod.token
    ? userInfo(token, oidcService.options.userInfoMapping)
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
    return userInfo(token);
  }
}

function userInfo(token: string, userInfoMapping?: UserInfoMapping): UserInfo {
  const identity: any = JWT.decode(token);
  const { id, username } = userInfoMapping || {};
  return {
    id: identity[id] || identity.sub,
    username: identity[username] || identity.name || identity.username || identity.sub,
    tenant: identity.tenant,
  };
}
