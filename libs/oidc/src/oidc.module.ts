import { Module, DynamicModule, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy } from './strategies';
import { SessionSerializer } from './utils/session.serializer';
import { AuthController } from './controllers/auth.controller';
import { JwtService, JwtModule } from '@nestjs/jwt';
import {
  OidcModuleOptions,
  OidcModuleAsyncOptions,
  OidcOptionsFactory,
} from './interfaces';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { mergeDefaults, OidcHelpers } from './utils';
import { Issuer } from 'openid-client';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (jwtService: JwtService, oidcHelpers: OidcHelpers) => {
    const strategy = new OidcStrategy(jwtService, oidcHelpers);
    return strategy;
  },
  inject: [JwtService, OidcHelpers],
};

const OidcHelperFactory = {
  provide: 'OidcHelpers',
  useFactory: async (options: OidcModuleOptions) => {
    const issuer = options.issuer;
    const TrustIssuer = await Issuer.discover(issuer);
    const client = new TrustIssuer.Client(options.clientMetadata);
    const tokenStore = await TrustIssuer.keystore();
    options.authParams.redirect_uri = `${options.origin}/login/callback`;
    const helpers = new OidcHelpers(tokenStore, client, options);
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
  providers: [OidcHelperFactory, OidcStrategyFactory, SessionSerializer],
})
export class OidcModule {
  static register(options: OidcModuleOptions): DynamicModule {
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

  static registerAsync(options: OidcModuleAsyncOptions): DynamicModule {
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
        mergeDefaults(await optionsFactory.createOidcOptions()),
      inject: [options.useExisting || options.useClass],
    };
  }
}
