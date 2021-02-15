import { CorporateAccountsModule } from '@finastra/api_corporate-accounts';
import { Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): GqlModuleOptions {
    const playgroundDevOptions = {
      settings: {
        'request.credentials': 'include',
      },
    };
    return {
      typePaths: ['./**/*.graphql'],
      include: [CorporateAccountsModule],
      playground: process.env.NODE_ENV === 'production' ? false : playgroundDevOptions,
    };
  }
}
