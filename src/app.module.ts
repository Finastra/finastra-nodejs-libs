import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatsModule } from './cats/cats.module';
import { OidcModule } from '@uxd-finastra/oidc';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    OidcModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      useFactory: async (configService: ConfigService) => ({
        issuer: configService.get('OIDC_ISSUER'),
        clientMetadata: {
          client_id: configService.get('OIDC_CLIENT_ID'),
          client_secret: configService.get('OIDC_CLIENT_SECRET'),
        },
        authParams: {
          scopes: configService.get('OIDC_SCOPES'),
          resource: configService.get('OIDC_RESOURCE'),
        },
        origin: configService.get('OIDC_ORIGIN'),
      }),
      inject: [ConfigService],
    }),
    CatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
