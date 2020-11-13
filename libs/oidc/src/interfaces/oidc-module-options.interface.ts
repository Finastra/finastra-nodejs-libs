import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { AuthorizationParameters, ClientMetadata, HttpOptions } from 'openid-client';
import { UserInfoMapping } from './user.interface';

export type OidcModuleOptions = {
  origin: string;
  authParams: AuthorizationParameters;
  redirectUriLogout?: string;
  postLogoutUri?: string;
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
  { issuerOrigin: string } & ({ b2c: OidcChannelOptions } | { b2e: OidcChannelOptions })
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
