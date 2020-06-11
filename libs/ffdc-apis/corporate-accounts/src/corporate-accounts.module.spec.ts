import { TestingModule, Test } from '@nestjs/testing';
import { CorporateAccountsModule } from './corporate-accounts.module';

describe('CorporateAccountsModule', () => {
  describe('register sync', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [CorporateAccountsModule.forRoot({})],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });

  describe('register async', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          CorporateAccountsModule.forRootAsync({
            useFactory: async () => ({}),
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

    class corpAccountsConfig {
      createModuleConfig() {
        return {};
      }
    }

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          CorporateAccountsModule.forRootAsync({
            useClass: corpAccountsConfig,
          }),
        ],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });
});
