import { Test, TestingModule } from '@nestjs/testing';
import { CorporateAccountsService } from './corporate-accounts.service';
import axios from 'axios';
import { AccountType } from '../interfaces';
import { ConfigService } from '@nestjs/config';
import { CORP_ACCOUNTS_MODULE_OPTIONS } from '../constants';

const user = {
  access_token: '123',
};

describe('CorporateAccountsService', () => {
  let service: CorporateAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorporateAccountsService,
        {
          provide: CORP_ACCOUNTS_MODULE_OPTIONS,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CorporateAccountsService>(CorporateAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccounts', () => {
    it('should make a request', async () => {
      const mockAccounts = [];
      jest
        .spyOn(axios, 'request')
        .mockReturnValue(Promise.resolve({ data: mockAccounts }));
      expect(await service.getAccounts(user, 10, 0)).toBe(mockAccounts);
    });
  });

  describe('getAccountsDetails', () => {
    it('should make a request', async () => {
      const mockAccounts = [
        {
          availableBalance: '55,456.72',
          availableBalanceEquivalent: '55,456.72',
        },
      ];
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          data: {
            items: mockAccounts,
          },
        }),
      );
      let accounts = await service.getAccountsDetails(
        user,
        AccountType.CURRENT,
        10,
        0,
      );
      expect(accounts.items[0].availableBalance).toBe('55456.72');

      accounts = await service.getAccountsDetails(
        user,
        AccountType.CURRENT,
        10,
        0,
        'EUR',
      );
      expect(accounts.items[0].availableBalanceEquivalent).toBe('55456.72');
    });
  });

  describe('getAccountBalance', () => {
    it('should make a request', async () => {
      const mockAccount = {
        availableBalance: '123',
        ledgerBalance: '456',
      };
      jest
        .spyOn(axios, 'request')
        .mockReturnValue(Promise.resolve({ data: mockAccount }));
      expect(await service.getAccountBalance(user, '123')).toStrictEqual(
        mockAccount,
      );
    });
  });

  describe('getAccountDetail', () => {
    it('should make a request', async () => {
      const mockAccount = {};
      jest
        .spyOn(axios, 'request')
        .mockReturnValue(Promise.resolve({ data: mockAccount }));
      expect(await service.getAccountDetail(user, '123')).toStrictEqual(
        mockAccount,
      );
    });
  });

  describe('getAccountStatement', () => {
    it('should make a request', async () => {
      const mockStatement = [
        {
          amount: '123',
          balance: '456',
        },
      ];
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          data: {
            items: mockStatement,
          },
        }),
      );
      let statement = await service.getAccountStatement(
        user,
        '123',
        'fromDate',
        'toDate',
        10,
        0,
      );
      expect(statement.items).toStrictEqual(mockStatement);

      statement = await service.getAccountStatement(
        user,
        '123',
        'fromDate',
        'toDate',
        undefined,
        undefined,
      );
      expect(statement.items).toStrictEqual(mockStatement);
    });
  });
});
