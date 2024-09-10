import { createMock } from '@golevelup/nestjs-testing';
import { MiddlewareConsumer } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Issuer } from 'openid-client';
import { MOCK_ISSUER_INSTANCE, MOCK_OIDC_MODULE_OPTIONS } from './mocks';
import { OidcModule } from './oidc.module';

describe(OidcModule.name, () => {
  describe('register sync', () => {
    let module: TestingModule;

    beforeEach(async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest.spyOn(Issuer, 'discover').mockImplementation(() => Promise.resolve(IssuerMock));
      module = await Test.createTestingModule({
        imports: [OidcModule.forRoot(MOCK_OIDC_MODULE_OPTIONS)],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });

  describe('register async', () => {
    let module: TestingModule;

    beforeEach(async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest.spyOn(Issuer, 'discover').mockImplementation(() => Promise.resolve(IssuerMock));
      module = await Test.createTestingModule({
        imports: [
          OidcModule.forRootAsync({
            useFactory: async () => MOCK_OIDC_MODULE_OPTIONS,
          }),
        ],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });

  describe('register async with useClass', () => {
    let module: TestingModule;

    class oidcModuleOptions {
      createModuleConfig() {
        MOCK_OIDC_MODULE_OPTIONS.defaultHttpOptions = null;
        MOCK_OIDC_MODULE_OPTIONS.authParams.nonce = 'true';
        return MOCK_OIDC_MODULE_OPTIONS;
      }
    }

    beforeEach(async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest.spyOn(Issuer, 'discover').mockImplementation(() => Promise.resolve(IssuerMock));
      module = await Test.createTestingModule({
        imports: [
          OidcModule.forRootAsync({
            useClass: oidcModuleOptions,
          }),
        ],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });

  describe('configure middleware', () => {
    it('should be able to configure', () => {
      const module = new OidcModule();
      const consumer = createMock<MiddlewareConsumer>();
      module.configure(consumer);
      expect(module).toBeTruthy();
    });
  });
});
