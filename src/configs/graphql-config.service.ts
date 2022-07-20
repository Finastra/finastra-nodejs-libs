import { CorporateAccountsModule } from '@finastra/api_corporate-accounts';
import { ApolloDriverConfig, ApolloDriverConfigFactory } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GqlConfigService implements ApolloDriverConfigFactory {
  createGqlOptions(): ApolloDriverConfig {
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
