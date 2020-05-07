import { Module } from '@nestjs/common';
import { CorporateAccountsService } from './corporate-accounts.service';
import {
  CorporateAccountResolver,
  AccountBasicResolver,
  AccountsBalanceResolver,
  AccountwBalanceResolver,
  AccountDetailResolver,
  AccountBalanceResolver,
  AccountStatementResolver,
} from './resolvers';

@Module({
  providers: [
    CorporateAccountsService,
    CorporateAccountResolver,
    AccountBasicResolver,
    AccountsBalanceResolver,
    AccountwBalanceResolver,
    AccountDetailResolver,
    AccountBalanceResolver,
    AccountStatementResolver,
  ],
  exports: [CorporateAccountsService],
})
export class CorporateAccountsModule {}
