import { Module, DynamicModule, Provider, Logger } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy } from './strategies';
import { SessionSerializer } from './utils/session.serializer';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import {
  OidcModuleOptions,
  OidcModuleAsyncOptions,
  OidcOptionsFactory,
} from './interfaces';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { mergeDefaults, OidcHelpers } from './utils';
import { Issuer, custom } from 'openid-client';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from './mocks';

const logger = new Logger('OidcModule');

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (oidcHelpers: OidcHelpers) => {
    const strategy = new OidcStrategy(oidcHelpers);
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
    const issuer = options.issuer;
    try {
      const TrustIssuer = await Issuer.discover(issuer);
      const client = new TrustIssuer.Client(options.clientMetadata);
      const tokenStore = await TrustIssuer.keystore();
      options.authParams.redirect_uri = `${options.origin}/login/callback`;
      options.authParams.nonce =
        options.authParams.nonce === 'true' ? uuid() : options.authParams.nonce;
      const helpers = new OidcHelpers(tokenStore, client, options);
      return helpers;
    } catch (err) {
      const docUrl =
        'https://github.com/fusionfabric/finastra-nodejs-libs/blob/develop/libs/oidc/README.md';
      const msg = `Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : ${docUrl}`;
      logger.error(msg);
      logger.log('Terminating application');
      process.exit(1);
      return {
        client: MOCK_CLIENT_INSTANCE,
        config: {
          authParams: undefined,
          usePKCE: undefined,
        },
      }; // Used for unit test
    }
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
  exports: [OidcHelperFactory],
})
export class OidcModule {
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
