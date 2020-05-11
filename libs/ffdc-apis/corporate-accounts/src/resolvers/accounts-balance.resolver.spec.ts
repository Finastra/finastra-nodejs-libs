import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { createMock } from '@golevelup/nestjs-testing';
import { AccountsBalanceResolver } from './accounts-balance.resolver';
import { AccountType } from '../interfaces';

describe('AccountsBalanceResolver', () => {
  let resolver: AccountsBalanceResolver;
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsBalanceResolver,
        {
          provide: CorporateAccountsService,
          useValue: createMock<CorporateAccountsService>(),
        },
      ],
    }).compile();

    resolver = module.get<AccountsBalanceResolver>(AccountsBalanceResolver);
    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('accountsBalance', () => {
    it('should request service', () => {
      resolver.accountsBalance({}, AccountType.CURRENT, 10, 0, 'EUR');
      expect(service.getAccountsDetails).toHaveBeenCalled();
    });

    it('should request service with default values', () => {
      resolver.accountsBalance(
        {},
        AccountType.CURRENT,
        undefined,
        undefined,
        'EUR',
      );
      expect(service.getAccountsDetails).toHaveBeenCalled();
    });
  });
});
