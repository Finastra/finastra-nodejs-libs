import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TenantSwitchController } from './controllers';
import { AuthMultitenantMultiChannelController } from './controllers/auth-multitenant-multichannel.controller';
import { AuthMultitenantController } from './controllers/auth-multitenant.controller';
import { AuthController } from './controllers/auth.controller';
import { HttpExceptionFilter } from './filters';
import { GuestTokenGuard, TenancyGuard, TokenGuard } from './guards';
import { OidcModuleOptions } from './interfaces';
import { LoginMiddleware, UserMiddleware } from './middlewares';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { OidcService, SSRPagesService } from './services';
import { OidcConfigService } from './services/oidc-config.service';
import { OidcPassportStrategy, STRATEGY_NAME } from './strategies';
// import { mergeDefaults } from './utils';
import { SessionSerializer } from './utils/session.serializer';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    PassportModule.register({ session: true, defaultStrategy: STRATEGY_NAME })
  ],
  controllers: [
    AuthController,
    AuthMultitenantController,
    AuthMultitenantMultiChannelController,
    TenantSwitchController,
  ],
  providers: [
    OidcConfigService,
    {
      provide: OIDC_MODULE_OPTIONS,
      useFactory: (oidcConfigService: OidcConfigService) => oidcConfigService.getOptions(),
      inject: [OidcConfigService]
    },
    {
      provide: 'OidcStrategy',
      useFactory: async (options: OidcModuleOptions, oidcService: OidcService) => {
        const client = await oidcService.buildOpenIdClient(options);
        const strategy = new OidcPassportStrategy(client, options);
        oidcService.idpInfos.set('default.default', { client, strategy });
        return strategy;
      },
      inject: [OIDC_MODULE_OPTIONS, OidcService]
    },
    SessionSerializer,
    TokenGuard,
    GuestTokenGuard,
    OidcService,
    SSRPagesService,
    {
      provide: APP_GUARD,
      useClass: TenancyGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [SSRPagesService],
})
export class OidcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .exclude({ path: '/user', method: RequestMethod.GET })
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(LoginMiddleware)
      .forRoutes(
        { path: '/login', method: RequestMethod.ALL },
        { path: '/:tenantId/login', method: RequestMethod.ALL },
        { path: '/:tenantId/:channelType/login', method: RequestMethod.ALL },
      );
  }

  // static forRoot(options: OidcModuleOptions): DynamicModule {
  //   // options = mergeDefaults(options);
  //   return {
  //     module: OidcModule,
  //     providers: [
  //       {
  //         provide: OIDC_MODULE_OPTIONS,
  //         useValue: options,
  //       },
  //     ],
  //   };
  // }

  // static forRootAsync(options: OidcModuleAsyncOptions): DynamicModule {
  //   return {
  //     module: OidcModule,
  //     imports: options.imports,
  //     providers: [...this.createAsyncProviders(options)],
  //   };
  // }

  // private static createAsyncProviders(options: OidcModuleAsyncOptions): Provider[] {
  //   if (options.useExisting || options.useFactory) {
  //     return [this.createAsyncOptionsProvider(options)];
  //   }
  //   return [
  //     this.createAsyncOptionsProvider(options),
  //     {
  //       provide: options.useClass,
  //       useClass: options.useClass,
  //     },
  //   ];
  // }

  // private static createAsyncOptionsProvider(options: OidcModuleAsyncOptions): Provider {
  //   if (options.useFactory) {
  //     return {
  //       provide: OIDC_MODULE_OPTIONS,
  //       useFactory: async (...args: any[]) => mergeDefaults(await options.useFactory(...args)),
  //       inject: options.inject || [],
  //     };
  //   }
  //   return {
  //     provide: OIDC_MODULE_OPTIONS,
  //     useFactory: async (optionsFactory: OidcOptionsFactory) =>
  //       mergeDefaults(await optionsFactory.createModuleConfig()),
  //     inject: [options.useExisting || options.useClass],
  //   };
  // }
}
