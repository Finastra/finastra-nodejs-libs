import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  AccountwBalance,
  AccountBasic,
  AccountBalance,
  AccountDetail,
  AccountType,
  AccountStatement,
  FFDCItems,
  User,
  CorpAccountsModuleOptions,
} from '../interfaces';
import { CORPORATE_ACCOUNTS_API, CORP_ACCOUNTS_MODULE_OPTIONS } from '../constants';
import { RequestService } from './request.service';

@Injectable()
export class CorporateAccountsService extends RequestService {
  constructor(
    @Inject(CORP_ACCOUNTS_MODULE_OPTIONS)
    private moduleOptions: CorpAccountsModuleOptions,
  ) {
    super(
      `${moduleOptions.ffdcApi || 'https://api.fusionfabric.cloud'}/${CORPORATE_ACCOUNTS_API}`,
      CorporateAccountsService.name,
    );
  }

  async getAccounts(user: User, limit: number, offset: number) {
    const accountContext = 'ViewAccount';
    const url = `?accountContext=${accountContext}&limit=${limit}&offset=${offset}`;
    const res = await this.get<FFDCItems<AccountBasic[]>>(url, user);
    return res;
  }

  async getAccountsDetails(
    user: User,
    accountType: AccountType,
    limit: number,
    offset: number,
    equivalentCurrency?: string,
  ) {
    let url = `/balances-by-account-type?limit=${limit}&offset=${offset}&accountTypeForBalance=${accountType}`;

    if (equivalentCurrency) url += `&equivalentCurrency=${equivalentCurrency}`;

    const accounts = await this.get<FFDCItems<AccountwBalance[]>>(url, user);

    accounts.items = accounts.items.map(account => {
      return this.sanitizeProperties<AccountwBalance>(account, ['availableBalance', 'availableBalanceEquivalent']);
    });

    return accounts;
  }

  async getAccountBalance(user: User, id: string): Promise<AccountBalance> {
    const url = `/${id}/balances`;
    const account = await this.get<AccountBalance>(url, user);
    return this.sanitizeProperties<AccountBalance>(account, ['availableBalance', 'ledgerBalance']);
  }

  async getAccountDetail(user: User, id: string): Promise<AccountDetail> {
    const url = `/${id}`;
    const account = await this.get<AccountDetail>(url, user);
    return account;
  }

  async getAccountStatement(
    user: User,
    id: string,
    fromDate: string,
    toDate: string,
    limit: number,
    offset: number,
  ): Promise<FFDCItems<AccountStatement[]>> {
    let url = `/${id}/statement?fromDate=${fromDate}&toDate=${toDate}`;

    if (limit) url += `&limit=${limit}`;
    if (offset || offset === 0) url += `&offset=${offset}`;

    const statement = await this.get<FFDCItems<AccountStatement[]>>(url, user);
    statement.items = statement.items.map(transaction => {
      return this.sanitizeProperties<AccountStatement>(transaction, ['amount', 'balance']);
    });
    return statement;
  }

  private sanitizeProperties<T>(object: Object, props: string[]) {
    const newObj = { ...object };
    props.forEach(property => {
      newObj[property] = this.sanitizeNumber(object[property]);
    });
    return newObj as T;
  }

  private sanitizeNumber(nb: string) {
    return nb.replace(/\,/g, '');
  }
}
