import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from './corporate-accounts.service';

describe('CorporateAccountsService', () => {
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporateAccountsService],
    }).compile();

    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
