import { Module } from '@nestjs/common';
import { CorporateAccountsService } from './corporate-accounts.service';
import { CorporateAccountResolver } from './corporate-accounts.resolver';

@Module({
  providers: [CorporateAccountsService, CorporateAccountResolver],
  exports: [CorporateAccountsService],
})
export class CorporateAccountsModule {}
