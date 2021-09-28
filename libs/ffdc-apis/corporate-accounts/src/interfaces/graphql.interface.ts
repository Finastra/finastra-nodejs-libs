/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum AccountType {
  CURRENT = 'CURRENT',
  DEPOSIT = 'DEPOSIT',
  SAVINGS = 'SAVINGS',
  LOAN = 'LOAN',
  TERMDEPOSIT = 'TERMDEPOSIT',
  CREDITCARD = 'CREDITCARD',
  OTHER = 'OTHER',
}

export enum AccountFormat {
  BBAN = 'BBAN',
  IBAN = 'IBAN',
  UPIC = 'UPIC',
  DMST = 'DMST',
  OTHER = 'OTHER',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AccountContext {
  ViewAccount = 'ViewAccount',
  INT = 'INT',
  TPT = 'TPT',
  DOM = 'DOM',
  MT103 = 'MT103',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface Account {
  id: string;
  currency: string;
  type: AccountType;
}

export interface IQuery {
  accounts(
    limit?: Nullable<number>,
    offset?: Nullable<number>,
    fromDate?: Nullable<string>,
    toDate?: Nullable<string>,
    statementLimit?: Nullable<number>,
    statementOffset?: Nullable<number>,
  ): Nullable<AccountBasicRes> | Promise<Nullable<AccountBasicRes>>;
  accountsBalance(
    accountType?: Nullable<AccountType>,
    limit?: Nullable<number>,
    offset?: Nullable<number>,
    fromDate?: Nullable<string>,
    toDate?: Nullable<string>,
    equivalentCurrency?: Nullable<string>,
    statementLimit?: Nullable<number>,
    statementOffset?: Nullable<number>,
  ): Nullable<AccountwBalanceRes> | Promise<Nullable<AccountwBalanceRes>>;
  account(id: string): Nullable<AccountDetail> | Promise<Nullable<AccountDetail>>;
  accountBalance(id: string): Nullable<AccountBalance> | Promise<Nullable<AccountBalance>>;
  accountStatement(
    id: string,
    fromDate: string,
    toDate: string,
    limit?: Nullable<number>,
    offset?: Nullable<number>,
  ): Nullable<AccountStatementRes> | Promise<Nullable<AccountStatementRes>>;
}

export interface AccountBasic extends Account {
  id: string;
  currency: string;
  type: AccountType;
  number: string;
  accountContext: AccountContext;
  balances?: Nullable<AccountBalance>;
  statement?: Nullable<AccountStatementRes>;
}

export interface AccountBasicRes {
  items?: Nullable<Nullable<AccountBasic>[]>;
  _meta?: Nullable<FFDCMeta>;
}

export interface AccountBalance extends Account {
  id: string;
  currency: string;
  type: AccountType;
  ledgerBalance: string;
  availableBalance: string;
  balanceAsOn: string;
}

export interface AccountwBalance extends Account {
  id: string;
  currency: string;
  type: AccountType;
  ledgerBalance: string;
  availableBalance: string;
  availableBalanceEquivalent: string;
  balanceAsOn: string;
  equivalentCurrency: string;
  details?: Nullable<AccountDetail>;
  statement?: Nullable<AccountStatementRes>;
}

export interface AccountwBalanceRes {
  items?: Nullable<Nullable<AccountwBalance>[]>;
  _meta?: Nullable<FFDCMeta>;
}

export interface AccountDetail extends Account {
  id: string;
  type: AccountType;
  number: string;
  currency: string;
  format: AccountFormat;
  country?: Nullable<string>;
  status: AccountStatus;
  cutomerReference?: Nullable<string>;
  interestRate?: Nullable<number>;
  debitInterestRate?: Nullable<number>;
  creditInterestRate?: Nullable<number>;
  principalAmount?: Nullable<number>;
  maturityAmount?: Nullable<number>;
  accountStartDate?: Nullable<string>;
  accountEndDate?: Nullable<string>;
  bankShortName?: Nullable<string>;
  overDraftLimit?: Nullable<number>;
}

export interface AccountStatement {
  postingDate?: Nullable<string>;
  valueDate?: Nullable<string>;
  currency: string;
  amount: number;
  transactionType: TransactionType;
  balance: number;
  backOfficeReference?: Nullable<string>;
  ref1?: Nullable<string>;
  ref2?: Nullable<string>;
}

export interface AccountStatementRes {
  items?: Nullable<Nullable<AccountStatement>[]>;
  _meta?: Nullable<FFDCMeta>;
}

export interface FFDCMeta {
  limit?: Nullable<number>;
  pageCount?: Nullable<number>;
  itemCount?: Nullable<number>;
  page?: Nullable<number>;
}

type Nullable<T> = T | null;
