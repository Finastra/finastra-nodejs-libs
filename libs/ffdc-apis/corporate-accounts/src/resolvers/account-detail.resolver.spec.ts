import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { createMock } from '@golevelup/nestjs-testing';
import { AccountDetailResolver } from './account-detail.resolver';

describe('AccountDetailResolver', () => {
  let resolver: AccountDetailResolver;
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountDetailResolver,
        {
          provide: CorporateAccountsService,
          useValue: createMock<CorporateAccountsService>(),
        },
      ],
    }).compile();

    resolver = module.get<AccountDetailResolver>(AccountDetailResolver);
    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('account', () => {
    it('should request service', () => {
      resolver.account({}, '123');
      expect(service.getAccountDetail).toHaveBeenCalled();
    });
  });
});
