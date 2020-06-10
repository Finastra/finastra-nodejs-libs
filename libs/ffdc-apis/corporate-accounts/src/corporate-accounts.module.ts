import { Module } from '@nestjs/common';
import { CorporateAccountsService } from './services';
import {
  CorporateAccountResolver,
  AccountBasicResolver,
  AccountsBalanceResolver,
  AccountwBalanceResolver,
  AccountDetailResolver,
  AccountBalanceResolver,
  AccountStatementResolver,
} from './resolvers';
import { ConfigModule } from '@nestjs/config';

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
  imports: [ConfigModule],
})
export class CorporateAccountsModule {}
