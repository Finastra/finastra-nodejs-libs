import { Server } from 'http-proxy';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface Service {
  id: string;
  url: string;
  config?: Server.ServerOptions;
}

export interface ProxyModuleOptions {
  config?: Server.ServerOptions;
  services?: Service[];
}

export interface ProxyModuleOptionsFactory {
  createModuleConfig(): Promise<ProxyModuleOptions> | ProxyModuleOptions;
}

export interface ProxyModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ProxyModuleOptionsFactory>;
  useClass?: Type<ProxyModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ProxyModuleOptions> | ProxyModuleOptions;
  inject?: any[];
}
