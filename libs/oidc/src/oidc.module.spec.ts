import { TestingModule, Test } from '@nestjs/testing';
import { createMock } from '@golevelup/nestjs-testing';
import { Client, Issuer } from 'openid-client';
import { JWKS } from 'jose';
import { JwtService } from '@nestjs/jwt';
import { OidcModule } from './oidc.module';
import { OidcHelpers } from './utils';
import {
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_CLIENT_INSTANCE,
  MOCK_ISSUER_INSTANCE,
} from './mocks';

const keyStore = new JWKS.KeyStore([]);
const MockOidcHelpers = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
);

describe('OidcModule', () => {
  describe('register sync', () => {
    let module: TestingModule;

    beforeEach(async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest
        .spyOn(Issuer, 'discover')
        .mockImplementation(() => Promise.resolve(IssuerMock));
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
      jest
        .spyOn(Issuer, 'discover')
        .mockImplementation(() => Promise.resolve(IssuerMock));
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
        return MOCK_OIDC_MODULE_OPTIONS;
      }
    }

    beforeEach(async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest
        .spyOn(Issuer, 'discover')
        .mockImplementation(() => Promise.resolve(IssuerMock));
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
});
