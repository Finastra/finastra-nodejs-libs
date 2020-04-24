import { Server } from 'http-proxy';
import { ModuleConfigFactory } from '@golevelup/nestjs-modules';

export interface Service {
  id: string;
  url: string;
  config?: Server.ServerOptions;
}

export interface ProxyModuleOptions {
  config?: Server.ServerOptions;
  services?: Service[];
}

export type ProxyModuleOptionsFactory = ModuleConfigFactory<ProxyModuleOptions>;
