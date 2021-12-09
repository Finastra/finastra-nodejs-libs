import { DynamicModule, Global, MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TenantSwitchController } from './controllers';
import { AuthMultitenantMultiChannelController } from './controllers/auth-multitenant-multichannel.controller';
import { AuthMultitenantController } from './controllers/auth-multitenant.controller';
import { AuthController } from './controllers/auth.controller';
import { LoginCallbackController } from './controllers/login-callback.controller';
import { HttpExceptionFilter } from './filters';
import { TenancyGuard, TokenGuard } from './guards';
import { OidcModuleAsyncOptions, OidcModuleOptions, OidcOptionsFactory } from './interfaces';
import { LoginMiddleware, UserMiddleware } from './middlewares';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { OidcService, SSRPagesService } from './services';
import { mergeDefaults } from './utils';
import { SessionSerializer } from './utils/session.serializer';

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [
    AuthController,
    AuthMultitenantController,
    AuthMultitenantMultiChannelController,
    LoginCallbackController,
    TenantSwitchController,
  ],
  providers: [
    SessionSerializer,
    TokenGuard,
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

  static forRoot(options: OidcModuleOptions): DynamicModule {
    options = mergeDefaults(options);
    return {
      module: OidcModule,
      providers: [
        {
          provide: OIDC_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: OidcModuleAsyncOptions): DynamicModule {
    return {
      module: OidcModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options)],
    };
  }

  private static createAsyncProviders(options: OidcModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: OidcModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: OIDC_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => mergeDefaults(await options.useFactory(...args)),
        inject: options.inject || [],
      };
    }
    return {
      provide: OIDC_MODULE_OPTIONS,
      useFactory: async (optionsFactory: OidcOptionsFactory) =>
        mergeDefaults(await optionsFactory.createModuleConfig()),
      inject: [options.useExisting || options.useClass],
    };
  }
}
