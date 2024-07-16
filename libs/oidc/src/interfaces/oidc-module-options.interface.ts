import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { AuthorizationParameters, Client, ClientMetadata, HttpOptions } from 'openid-client';
import { OidcPassportStrategy } from '../strategies';
import { UserInfoMapping } from './user.interface';

export type OidcModuleOptions = {
  origin: string;
  authParams: AuthorizationParameters;
  redirectUriLogout?: string;
  postLogoutRedirectUri?: string;
  usePKCE?: boolean;
  defaultHttpOptions?: HttpOptions;
  externalIdps?: ExternalIdps;
  userInfoCallback?: any;
  userInfoMethod?: UserInfoMethod;
  userInfoMapping?: UserInfoMapping;
} & XOR<
  {
    issuer: string;
    clientMetadata: ClientMetadata;
  },
  { issuerOrigin: string } & ({ b2c: OidcChannelOptions } | { b2e: OidcChannelOptions }) & {
    channelType?: ChannelType;
  }
>;

interface OidcChannelOptions {
  clientMetadata: ClientMetadata;
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export interface OidcOptionsFactory {
  createModuleConfig(): Promise<OidcModuleOptions> | OidcModuleOptions;
}

export interface OidcModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OidcOptionsFactory>;
  useClass?: Type<OidcOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<OidcModuleOptions> | OidcModuleOptions;
  inject?: any[];
}

export enum UserInfoMethod {
  token = 'token',
  endpoint = 'endpoint',
}

export enum ChannelType {
  b2c = 'b2c',
  b2e = 'b2e',
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
  channel?: ChannelType;
}

export interface ExternalIdps {
  [idpName: string]: IdentityProviderOptions;
}

export interface IdpInfo {
  client: Client;
  strategy: OidcPassportStrategy;
  // strategy: Strategy<UserinfoResponse<UserInfo>, BaseClient>;
}

export interface IdpInfos {
  [tokenName: string]: IdpInfo;
}

export interface OidcEnvironmentVariables {
  OIDC_CLIENT_ID: string;
  OIDC_CLIENT_SECRET: string;
  OIDC_ISSUER: string;
  OIDC_ORIGIN: string;
  OIDC_REDIRECT_URI: string;
  OIDC_SCOPE: string;
  OIDC_RESOURCE: string;
  CLOCK_TOLERANCE: number;
  TIMEOUT: number;
  USER_INFO_METHOD: UserInfoMethod;
}