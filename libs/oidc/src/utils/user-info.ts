// import { Logger } from '@nestjs/common';
// import { decodeJwt } from 'jose';
// import { UserinfoResponse } from 'openid-client';
// import { UserInfo, UserInfoMapping, UserInfoMethod } from '../interfaces';
// import { OidcService } from '../services';

// const logger = new Logger('UserInfo');

// export async function getUserInfo(
//   token: string,
//   oidcService: OidcService,
//   idpKey: string,
// ): Promise<UserInfo | UserinfoResponse> {
//   let userInfoData = await (oidcService.options.userInfoMethod === UserInfoMethod.token
//     ? userInfo(token, oidcService.options.userInfoMapping)
//     : userInfoRemote(token, oidcService, idpKey));

//   if (oidcService.options.userInfoCallback) {
//     userInfoData = {
//       ...userInfoData,
//       ...(await oidcService.options.userInfoCallback(userInfoData.username, oidcService.options.externalIdps)),
//     };
//   }

//   return userInfoData;
// }

// async function userInfoRemote(
//   token: string,
//   oidcService: OidcService,
//   idpKey: string,
// ): Promise<UserInfo | UserinfoResponse> {
//   try {
//     return await oidcService.idpInfos[idpKey].client.userinfo(token);
//   } catch (err) {
//     const msg = `Error accessing user information`;
//     logger.error(msg);
//     return userInfo(token);
//   }
// }

// function userInfo(token: string, userInfoMapping?: UserInfoMapping): UserInfo {
//   const identity: any = decodeJwt(token);
//   const { id, username } = userInfoMapping || {};
//   return {
//     id: identity[id] || identity.sub,
//     username: identity[username] || identity.name || identity.username || identity.sub,
//     tenant: identity.tenant,
//     ...(identity.email && { email: identity.email }),
//   };
// }

import { Logger } from '@nestjs/common';
import { decodeJwt, JWTPayload } from 'jose';
import { Client, UserinfoResponse } from 'openid-client';
import { OidcModuleOptions, UserInfo, UserInfoMapping, UserInfoMethod } from '../interfaces';

const logger = new Logger('UserInfo');

export async function getUserInfo(
  token: string,
  options: OidcModuleOptions,
  client: Client
): Promise<UserInfo | UserinfoResponse> {
  let userInfoData = await (options.userInfoMethod === UserInfoMethod.token
    ? userInfo(token, options.userInfoMapping)
    : userInfoRemote(token, client));

  if (options.userInfoCallback) {
    const userCallback = await options.userInfoCallback(userInfoData.username, options.externalIdps)

    userInfoData = {
      ...userInfoData,
      ...userCallback,
    };
  }

  return userInfoData;
}

function userInfo(token: string, userInfoMapping?: UserInfoMapping): UserInfo {
  const jwtPayload: JWTPayload = decodeJwt(token);
  const { id, username } = userInfoMapping ?? {};
  return {
    id: jwtPayload.id as string ?? jwtPayload.sub ?? id,
    username: username ?? jwtPayload.username as string ?? jwtPayload.name as string ?? jwtPayload.sub,
    tenant: jwtPayload.tenant as string,
    ...(jwtPayload.email && { email: jwtPayload.email as string }),
  };
}

async function userInfoRemote(
  token: string,
  client: Client,
): Promise<UserInfo> {
  try {
    return await client.userinfo(token);
  } catch (err) {
    const msg = `Error accessing user information`;
    logger.error(msg);
    return userInfo(token);
  }
}
