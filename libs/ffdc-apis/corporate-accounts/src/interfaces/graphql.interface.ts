
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum AccountType {
    CURRENT = "CURRENT",
    DEPOSIT = "DEPOSIT",
    SAVINGS = "SAVINGS",
    LOAN = "LOAN",
    TERMDEPOSIT = "TERMDEPOSIT",
    CREDITCARD = "CREDITCARD",
    OTHER = "OTHER"
}

export enum AccountFormat {
    BBAN = "BBAN",
    IBAN = "IBAN",
    UPIC = "UPIC",
    DMST = "DMST",
    OTHER = "OTHER"
}

export enum AccountStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export enum AccountContext {
    ViewAccount = "ViewAccount",
    INT = "INT",
    TPT = "TPT",
    DOM = "DOM",
    MT103 = "MT103"
}

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}

export interface Account {
    id: string;
    currency: string;
    type: AccountType;
}

export interface IQuery {
    accounts(limit?: number, offset?: number, fromDate?: string, toDate?: string, statementLimit?: number, statementOffset?: number): AccountBasicRes | Promise<AccountBasicRes>;
    accountsBalance(accountType?: AccountType, limit?: number, offset?: number, fromDate?: string, toDate?: string, equivalentCurrency?: string, statementLimit?: number, statementOffset?: number): AccountwBalanceRes | Promise<AccountwBalanceRes>;
    account(id: string): AccountDetail | Promise<AccountDetail>;
    accountBalance(id: string): AccountBalance | Promise<AccountBalance>;
    accountStatement(id: string, fromDate: string, toDate: string, limit?: number, offset?: number): AccountStatementRes | Promise<AccountStatementRes>;
}

export interface AccountBasic extends Account {
    id: string;
    currency: string;
    type: AccountType;
    number: string;
    accountContext: AccountContext;
    balances?: AccountBalance;
    statement?: AccountStatementRes;
}

export interface AccountBasicRes {
    items?: AccountBasic[];
    _meta?: FFDCMeta;
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
    details?: AccountDetail;
    statement?: AccountStatementRes;
}

export interface AccountwBalanceRes {
    items?: AccountwBalance[];
    _meta?: FFDCMeta;
}

export interface AccountDetail extends Account {
    id: string;
    type: AccountType;
    number: string;
    currency: string;
    format: AccountFormat;
    country?: string;
    status: AccountStatus;
    cutomerReference?: string;
    interestRate?: number;
    debitInterestRate?: number;
    creditInterestRate?: number;
    principalAmount?: number;
    maturityAmount?: number;
    accountStartDate?: string;
    accountEndDate?: string;
    bankShortName?: string;
    overDraftLimit?: number;
}

export interface AccountStatement {
    postingDate?: string;
    valueDate?: string;
    currency: string;
    amount: number;
    transactionType: TransactionType;
    balance: number;
    backOfficeReference?: string;
    ref1?: string;
    ref2?: string;
}

export interface AccountStatementRes {
    items?: AccountStatement[];
    _meta?: FFDCMeta;
}

export interface FFDCMeta {
    limit?: number;
    pageCount?: number;
    itemCount?: number;
    page?: number;
}
