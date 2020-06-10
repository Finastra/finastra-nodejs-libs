import { TestingModule, Test } from '@nestjs/testing';
import { CorporateAccountsModule } from './corporate-accounts.module';
import { ConfigService } from '@nestjs/config';

class mockConfigService {
  get(role) {
    return role;
  }
}

describe('CorporateAccountsModule', () => {
  /* describe('register sync', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useClass: mockConfigService,
          },
        ],
        imports: [CorporateAccountsModule],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  }); */
  it('should be creatable', () => {
    const module = new CorporateAccountsModule();
    expect(module).toBeDefined();
  });
});
