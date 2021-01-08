import { CorporateAccountsModule } from '@ffdc/api_corporate-accounts';
import { LoggerModule } from '@ffdc/logger';
import { OidcModule } from '@ffdc/nestjs-oidc';
import { ProxyModule } from '@ffdc/nestjs-proxy';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { CatsModule } from './cats/cats.module';
import { GqlConfigService } from './configs/graphql-config.service';
import { OidcConfigService } from './configs/oidc-config.service';
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
    CatsModule,
    CorporateAccountsModule.forRoot({}),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
