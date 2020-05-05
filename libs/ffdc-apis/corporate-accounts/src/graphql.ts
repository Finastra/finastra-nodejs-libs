
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

export interface Account {
    id: string;
    currency: string;
    type: AccountType;
}

export abstract class IQuery {
    abstract getAccounts(balance?: boolean, limit?: number, offset?: number): AccountBasic[] | Promise<AccountBasic[]>;

    abstract getAccountsBalances(details?: boolean, accountType?: AccountType, limit?: number, offset?: number, equivalentCurrency?: string): AccountwBalance[] | Promise<AccountwBalance[]>;

    abstract account(id: string): AccountDetail | Promise<AccountDetail>;

    abstract accountBalance(id: string): AccountBalance | Promise<AccountBalance>;
}

export class AccountBasic implements Account {
    id: string;
    currency: string;
    type: AccountType;
    number: string;
    accountContext: AccountContext;
    balances?: AccountBalance;
}

export class AccountBalance implements Account {
    id: string;
    currency: string;
    type: AccountType;
    ledgerBalance: string;
    availableBalance: string;
    balanceAsOn: string;
}

export class AccountwBalance implements Account {
    id: string;
    currency: string;
    type: AccountType;
    ledgerBalance: string;
    availableBalance: string;
    availableBalanceEquivalent: string;
    balanceAsOn: string;
    equivalentCurrency: string;
    details?: AccountDetail;
}

export class AccountDetail implements Account {
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
