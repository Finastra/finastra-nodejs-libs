import {
  Module,
  DynamicModule,
  Provider,
  Logger,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { SessionSerializer } from './utils/session.serializer';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import {
  OidcModuleOptions,
  OidcModuleAsyncOptions,
  OidcOptionsFactory,
} from './interfaces';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { mergeDefaults } from './utils';
import { UserMiddleware } from './middlewares';
import { TokenGuard } from './guards';
import { OidcHelpersService } from './services';

const logger = new Logger('OidcModule');

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [SessionSerializer, TokenGuard, OidcHelpersService],
  exports: [OidcHelpersService],
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
