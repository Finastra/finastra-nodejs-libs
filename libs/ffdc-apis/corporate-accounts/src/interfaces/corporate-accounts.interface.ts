import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface CorpAccountsModuleOptions {
  ffdcApi?: string;
}

export interface CorpAccountsModuleOptionsFactory {
  createModuleConfig(): Promise<CorpAccountsModuleOptions> | CorpAccountsModuleOptions;
}

export interface CorpAccountsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<CorpAccountsModuleOptionsFactory>;
  useClass?: Type<CorpAccountsModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<CorpAccountsModuleOptions> | CorpAccountsModuleOptions;
  inject?: any[];
}
