import { UnauthorizedException } from '@nestjs/common';
import { UserInfoMethod } from '../interfaces';
import { OidcHelpers } from './oidc-helpers.util';
import { JWT } from 'jose';

export async function getUserInfo(
  accessToken: string,
  oidcHelpers: OidcHelpers,
) {
  let userInfoData =
    oidcHelpers.config.userInfoMethod === UserInfoMethod.token
      ? userInfo(accessToken)
      : userInfoRemote(accessToken, oidcHelpers);
  if (oidcHelpers.config.userInfoCallback) {
    userInfoData = {
      ...(await userInfoData),
      ...(await oidcHelpers.config.userInfoCallback(
        (await userInfoData).username,
      )),
    };
  }

  return userInfoData;
}

async function userInfoRemote(accessToken: string, oidcHelpers: OidcHelpers) {
  try {
    return await oidcHelpers.client.userinfo(accessToken);
  } catch (err) {
    throw new UnauthorizedException();
  }
}

function userInfo(accessToken: string) {
  const identity: any = JWT.decode(accessToken);
  return {
    username: identity.username || identity.name,
  };
}
