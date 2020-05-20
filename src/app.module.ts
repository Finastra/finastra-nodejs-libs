import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatsModule } from './cats/cats.module';
import { OidcModule } from '@ffdc/nestjs-oidc';
import { ProxyModule } from '@ffdc/nestjs-proxy';
import { GraphQLModule } from '@nestjs/graphql';
import { CorporateAccountsModule } from '@ffdc/api_corporate-accounts';

import { ProxyConfigService } from './configs/proxy-config.service';
import { GqlConfigService } from './configs/graphql-config.service';
import { OidcConfigService } from './configs/oidc-config.service';

@Module({
  imports: [
    CatsModule,
    CorporateAccountsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    OidcModule.forRootAsync({
      useClass: OidcConfigService,
      imports: [ConfigModule],
    }),
    ProxyModule.forRootAsync({
      useClass: ProxyConfigService,
      imports: [ConfigModule],
    }),
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
