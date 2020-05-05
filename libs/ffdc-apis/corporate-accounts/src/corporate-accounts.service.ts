import { Injectable } from '@nestjs/common';
import {
  AccountwBalance,
  AccountBasic,
  AccountBalance,
  AccountDetail,
  AccountType,
} from './graphql';
import axios from 'axios';
import { CORPORATE_ACCOUNTS_API } from './constants';
import { FFDCItems, User } from './interfaces';

@Injectable()
export class CorporateAccountsService {
  async getAccounts(
    user: User,
    balance: boolean,
    limit: number,
    offset: number,
  ) {
    const accountContext = 'ViewAccount';
    const url = `?accountContext=${accountContext}&limit=${limit}&offset=${offset}`;
    const res = await this.get<FFDCItems<AccountBasic[]>>(url, user);
    const accounts = res.data.items;

    return await Promise.all(
      accounts.map(async account => {
        if (balance) {
          account.balances = await this.getAccountBalance(user, account.id);
        }
        return account;
      }),
    );
  }

  async getAccountsDetails(
    user: User,
    details: boolean,
    accountType: AccountType,
    limit: number,
    offset: number,
    equivalentCurrency?: string,
  ) {
    let url = `/balances-by-account-type?limit=${limit}&offset=${offset}&accountTypeForBalance=${accountType}`;

    if (equivalentCurrency) url += `&equivalentCurrency=${equivalentCurrency}`;

    const res = await this.get<FFDCItems<AccountwBalance[]>>(url, user);
    const accounts = res.data.items;

    return await Promise.all(
      accounts.map(async account => {
        if (details) {
          account.details = await this.getAccountDetail(user, account.id);
        }
        return this.sanitizeProperties<AccountwBalance>(account, [
          'availableBalance',
          'availableBalanceEquivalent',
        ]);
      }),
    );
  }

  async getAccountBalance(user: User, id: string): Promise<AccountBalance> {
    const url = `/${id}/balances`;
    const res = await this.get<AccountBalance>(url, user);
    const account = res.data;
    return this.sanitizeProperties<AccountBalance>(account, [
      'availableBalance',
      'ledgerBalance',
    ]);
  }

  async getAccountDetail(user: User, id: string): Promise<AccountDetail> {
    const url = `/${id}`;
    const res = await this.get<AccountDetail>(url, user);
    const account = res.data;
    return account;
  }

  private async get<T>(target: string, user: User) {
    const url = CORPORATE_ACCOUNTS_API + target;
    return await axios.request<T>({
      url,
      headers: this.getHeaders(user),
    });
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

  private getHeaders(user: User) {
    const token = user.access_token;
    return {
      ...(token && { authorization: 'Bearer ' + token }),
    };
  }
}
