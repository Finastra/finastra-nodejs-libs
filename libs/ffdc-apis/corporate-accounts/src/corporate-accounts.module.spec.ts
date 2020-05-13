import { TestingModule, Test } from '@nestjs/testing';
import { CorporateAccountsModule } from './corporate-accounts.module';

describe('CorporateAccountsModule', () => {
  describe('register sync', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [CorporateAccountsModule],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });
});
