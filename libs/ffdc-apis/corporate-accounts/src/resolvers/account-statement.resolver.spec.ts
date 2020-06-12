import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from '../services';
import { createMock } from '@golevelup/nestjs-testing';
import { AccountStatementResolver } from './account-statement.resolver';

describe('AccountStatementResolver', () => {
  let resolver: AccountStatementResolver;
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountStatementResolver,
        {
          provide: CorporateAccountsService,
          useValue: createMock<CorporateAccountsService>(),
        },
      ],
    }).compile();

    resolver = module.get<AccountStatementResolver>(AccountStatementResolver);
    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('accountStatement', () => {
    it('should request service', () => {
      resolver.accountStatement({}, '123', 'date', 'date', 10, 0);
      expect(service.getAccountStatement).toHaveBeenCalled();
    });
  });
});
