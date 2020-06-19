import {
  Module,
  DynamicModule,
  Provider,
  Logger,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy, OidcStrategies } from './strategies';
import { SessionSerializer } from './utils/session.serializer';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import {
  OidcModuleOptions,
  OidcModuleAsyncOptions,
  OidcOptionsFactory,
} from './interfaces';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { mergeDefaults, OidcHelpers, getIssuerInfo } from './utils';
import { Issuer, custom } from 'openid-client';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from './mocks';
import { UserMiddleware } from './middlewares';
import { TokenGuard } from './guards';

const logger = new Logger('OidcModule');

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (oidcHelpers: OidcHelpers) => {
    const strategy = new OidcStrategies(oidcHelpers);
    return strategy;
  },
  inject: [OidcHelpers],
};

const OidcHelperFactory = {
  provide: 'OidcHelpers',
  useFactory: async (options: OidcModuleOptions) => {
    if (options.defaultHttpOptions) {
      custom.setHttpOptionsDefaults(options.defaultHttpOptions);
    }
    const idps = await getIssuerInfo(options);
    const helpers = new OidcHelpers(idps as any, options);
    return helpers;
  },
  inject: [OIDC_MODULE_OPTIONS],
};

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    OidcHelperFactory,
    OidcStrategyFactory,
    SessionSerializer,
    TokenGuard,
  ],
  exports: [OidcHelperFactory],
})
export class OidcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
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

  private static createAsyncProviders(
    options: OidcModuleAsyncOptions,
  ): Provider[] {
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

  private static createAsyncOptionsProvider(
    options: OidcModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OIDC_MODULE_OPTIONS,
        useFactory: async (...args: any[]) =>
          mergeDefaults(await options.useFactory(...args)),
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
