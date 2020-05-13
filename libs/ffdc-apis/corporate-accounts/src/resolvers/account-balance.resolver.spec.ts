import { Test, TestingModule } from '@nestjs/testing';
import { AccountBalanceResolver } from './account-balance.resolver';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { createMock } from '@golevelup/nestjs-testing';

describe('AccountBalanceResolver', () => {
  let resolver: AccountBalanceResolver;
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountBalanceResolver,
        {
          provide: CorporateAccountsService,
          useValue: createMock<CorporateAccountsService>(),
        },
      ],
    }).compile();

    resolver = module.get<AccountBalanceResolver>(AccountBalanceResolver);
    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('accountBalance', () => {
    it('should request service', () => {
      resolver.accountBalance({}, '123');
      expect(service.getAccountBalance).toHaveBeenCalled();
    });
  });
});
