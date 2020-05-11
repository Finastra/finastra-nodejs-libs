import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { createMock } from '@golevelup/nestjs-testing';
import { CorporateAccountResolver } from './accounts.resolver';

describe('CorporateAccountResolver', () => {
  let resolver: CorporateAccountResolver;
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorporateAccountResolver,
        {
          provide: CorporateAccountsService,
          useValue: createMock<CorporateAccountsService>(),
        },
      ],
    }).compile();

    resolver = module.get<CorporateAccountResolver>(CorporateAccountResolver);
    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('accounts', () => {
    it('should request service', () => {
      resolver.accounts({}, 10, 0);
      expect(service.getAccounts).toHaveBeenCalled();
    });

    it('should request service with default values', () => {
      resolver.accounts({}, undefined, undefined);
      expect(service.getAccounts).toHaveBeenCalled();
    });
  });
});
