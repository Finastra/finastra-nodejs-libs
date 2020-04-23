import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { AuthorizationParameters, ClientMetadata } from 'openid-client';

export interface OidcModuleOptions {
  issuer: string;
  clientMetadata: ClientMetadata;
  authParams: AuthorizationParameters;
  origin: string;
  usePKCE?: boolean;
  userInfoMethod?: UserInfoMethod;
}

export interface OidcOptionsFactory {
  createOidcOptions(): Promise<OidcModuleOptions> | OidcModuleOptions;
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
  ffdc = 'ffdc',
  oidc = 'oidc',
}
