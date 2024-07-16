import { CorporateAccountsModule } from '@finastra/api_corporate-accounts';
import { LoggerModule } from '@finastra/nestjs-logger';
import { OidcModule } from '@finastra/nestjs-oidc';
import { OidcConfigService } from '@finastra/nestjs-oidc/oidc-config.service';
import { ProxyModule } from '@finastra/nestjs-proxy';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { GqlConfigService } from './configs/graphql-config.service';
import { ProxyConfigService } from './configs/proxy-config.service';

@Module({
  imports: [
    LoggerModule,
    OidcModule.forRootAsync({
      useClass: OidcConfigService,
      imports: [ConfigModule],
    }),
    ProxyModule.forRootAsync({
      useClass: ProxyConfigService,
      imports: [ConfigModule],
    }),
    CorporateAccountsModule.forRoot({}),
    ConfigModule.forRoot({
      // envFilePath: './envs/localhost.env',
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
