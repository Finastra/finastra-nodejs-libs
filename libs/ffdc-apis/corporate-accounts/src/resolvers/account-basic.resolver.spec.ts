import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { createMock } from '@golevelup/nestjs-testing';
import { AccountBasicResolver } from './account-basic.resolver';

describe('AccountBasicResolver', () => {
  let resolver: AccountBasicResolver;
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountBasicResolver,
        {
          provide: CorporateAccountsService,
          useValue: createMock<CorporateAccountsService>(),
        },
      ],
    }).compile();

    resolver = module.get<AccountBasicResolver>(AccountBasicResolver);
    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('balances', () => {
    it('should request service', () => {
      resolver.balances({}, { id: '123' });
      expect(service.getAccountBalance).toHaveBeenCalled();
    });
  });

  describe('statement', () => {
    it('should request service', () => {
      resolver.statement({}, { id: '123' }, null, 'fromDate', 'toDate', 10, 0);
      expect(service.getAccountStatement).toHaveBeenCalled();
    });

    it('should request service with fieldArgs', () => {
      const fieldArgs = {
        fromDate: 'fromDate',
        toDate: 'toDate',
        statementLimit: 10,
        statementOffset: 0,
      };
      resolver.statement({}, { id: '123' }, fieldArgs, null, null, null, null);
      expect(service.getAccountStatement).toHaveBeenCalled();
    });

    it('should request service with default values if not provided in fieldArgs', () => {
      const fieldArgs = {
        fromDate: 'fromDate',
        toDate: 'toDate',
        statementLimit: null,
        statementOffset: null,
      };
      resolver.statement({}, { id: '123' }, fieldArgs, null, null, null, null);
      expect(service.getAccountStatement).toHaveBeenCalled();
    });
  });
});
