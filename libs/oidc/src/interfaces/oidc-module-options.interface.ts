import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import {
  AuthorizationParameters,
  ClientMetadata,
  HttpOptions,
} from 'openid-client';

export interface OidcModuleOptions {
  issuer: string;
  clientMetadata: ClientMetadata;
  authParams: AuthorizationParameters;
  origin: string;
  idleTime?: number;
  redirectUriLogout?: string;
  usePKCE?: boolean;
  userInfoMethod?: UserInfoMethod;
  defaultHttpOptions?: HttpOptions;
  externalIdps?: { [idpName: string]: IdentityProviderOptions };
  userInfoCallback?: any;
}

export interface OidcOptionsFactory {
  createModuleConfig(): Promise<OidcModuleOptions> | OidcModuleOptions;
}

export interface OidcModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OidcOptionsFactory>;
  useClass?: Type<OidcOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<OidcModuleOptions> | OidcModuleOptions;
  inject?: any[];
}

export enum UserInfoMethod {
  token = 'token',
  endpoint = 'endpoint',
}

export interface IdentityProviderOptions {
  clientId: string;
  clientSecret: string;
  issuer: string;
  scope: string;
  accessToken?: string;
  refreshToken?: string;
  tokenEndpoint?: string;
  expiresAt?: number;
}
