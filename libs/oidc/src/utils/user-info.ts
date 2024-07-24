import { Logger } from '@nestjs/common';
import { JWT } from 'jose';
import { Client, UserinfoResponse } from 'openid-client';
import { OidcModuleOptions, UserInfo, UserInfoMapping, UserInfoMethod } from '../interfaces';

const logger = new Logger('UserInfo');

export async function getUserInfo(
  token: string,
  options: OidcModuleOptions,
  client: Client
): Promise<UserInfo | UserinfoResponse> {
  let userInfoData = (options.userInfoMethod === UserInfoMethod.token
    ? await userInfo(token, client, options.userInfoMapping)
    : await userInfoRemote(token, client));

  if (options.userInfoCallback) {
    const userCallback = await options.userInfoCallback(userInfoData.username, options.externalIdps)

    userInfoData = {
      ...userInfoData,
      ...userCallback,
    };
  }

  return userInfoData;
}

async function userInfo(token: string, client: Client, userInfoMapping?: UserInfoMapping): Promise<UserInfo> {
  // const res = await fetch(client.issuer.metadata.jwks_uri);
  // const jwks/* : JSONWebKeySet */ = await res.json();
  // const tokenStore = await jose.createRemoteJWKSet(new URL(client.issuer.metadata.jwks_uri))
  // const decodedJwt = await jose.jwtVerify(token, tokenStore);
  // const jwtPayload: jose.JWTPayload = decodedJwt.payload;
  // const jwtPayload: jose.JWTPayload = jose.decodeJwt(token);
  const jwtPayload: any = JWT.decode(token);
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
    return userInfo(token, client);
  }
}
