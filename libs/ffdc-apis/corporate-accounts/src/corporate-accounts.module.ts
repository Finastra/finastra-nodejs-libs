import { Module, DynamicModule, Provider } from '@nestjs/common';
import { CorporateAccountsService } from './services';
import {
  CorporateAccountResolver,
  AccountBasicResolver,
  AccountsBalanceResolver,
  AccountwBalanceResolver,
  AccountDetailResolver,
  AccountBalanceResolver,
  AccountStatementResolver,
} from './resolvers';
import {
  CorpAccountsModuleOptions,
  CorpAccountsModuleAsyncOptions,
  CorpAccountsModuleOptionsFactory,
} from './interfaces';
import { CORP_ACCOUNTS_MODULE_OPTIONS } from './constants';

@Module({
  providers: [
    CorporateAccountsService,
    CorporateAccountResolver,
    AccountBasicResolver,
    AccountsBalanceResolver,
    AccountwBalanceResolver,
    AccountDetailResolver,
    AccountBalanceResolver,
    AccountStatementResolver,
  ],
  exports: [CorporateAccountsService],
})
export class CorporateAccountsModule {
  static forRoot(options: CorpAccountsModuleOptions): DynamicModule {
    return {
      module: CorporateAccountsModule,
      providers: [
        {
          provide: CORP_ACCOUNTS_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: CorpAccountsModuleAsyncOptions): DynamicModule {
    return {
      module: CorporateAccountsModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options)],
    };
  }

  private static createAsyncProviders(options: CorpAccountsModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: CorpAccountsModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CORP_ACCOUNTS_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => await options.useFactory(...args),
        inject: options.inject || [],
      };
    }
    return {
      provide: CORP_ACCOUNTS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: CorpAccountsModuleOptionsFactory) => await optionsFactory.createModuleConfig(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
