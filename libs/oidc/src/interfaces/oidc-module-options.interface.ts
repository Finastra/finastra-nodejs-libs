import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface OidcModuleOptions {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string; // Space separated ex: "oidc profile"
  redirectUriLogin: string;
  redirectUriLogout: string;
  userInfoMethod?: UserInfoMethod;
  clockTolerance?: number;
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
