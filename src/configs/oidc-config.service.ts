import { Injectable } from '@nestjs/common';
import { OidcOptionsFactory, OidcModuleOptions } from '@ffdc/nestjs-oidc';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OidcConfigService implements OidcOptionsFactory {
  constructor(private configService: ConfigService) {}

  createModuleConfig(): OidcModuleOptions {
    return {
      issuer: this.configService.get('OIDC_ISSUER'),
      clientMetadata: {
        client_id: this.configService.get('OIDC_CLIENT_ID'),
        client_secret: this.configService.get('OIDC_CLIENT_SECRET'),
      },
      authParams: {
        scope: this.configService.get('OIDC_SCOPE'),
        resource: this.configService.get('OIDC_RESOURCE'),
        nonce: 'true',
      },
      origin: this.configService.get('ORIGIN'),
      defaultHttpOptions: {
        timeout: 20000,
      },
      externalIdps: [
        {
          clientId: this.configService.get('OIDC_AAD_CLIENT_ID'),
          clientSecret: this.configService.get('OIDC_AAD_CLIENT_SECRET'),
          issuer: this.configService.get('OIDC_AAD_ISSUER'),
          scope: this.configService.get('OIDC_SCOPE'),
        },
      ],
      // userInfoCallback: async (userId, idpInfos) => {
      //   const accessToken = idpInfos.find(
      //     idp => idp.issuer === this.configService.get('OIDC_AAD_ISSUER'),
      //   ).accessToken;
      //   const groups = (
      //     await axios.request({
      //       method: 'get',
      //       url: `https://graph.microsoft.com/v1.0/users/${userId}/memberOf`,
      //       headers: {
      //         authorization: `Bearer ${accessToken}`,
      //       },
      //     })
      //   ).data.value.map(group => group.id);
      //   const userInfo = (
      //     await axios.request({
      //       method: 'get',
      //       url: `https://graph.microsoft.com/v1.0/users/${userId}`,
      //       headers: {
      //         authorization: `Bearer ${accessToken}`,
      //       },
      //     })
      //   ).data;
      //   return {
      //     id: userId,
      //     username: userInfo.displayName,
      //     groups,
      //   };
      // },
    };
  }
}
