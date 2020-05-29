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
  redirectUriLogout?: string;
  usePKCE?: boolean;
  userInfoMethod?: UserInfoMethod;
  defaultHttpOptions?: HttpOptions;
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
