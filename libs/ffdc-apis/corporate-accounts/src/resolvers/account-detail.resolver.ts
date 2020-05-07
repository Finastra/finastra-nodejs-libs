import { Resolver, Query, Args } from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';

@Resolver('AccountDetail')
export class AccountDetailResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async account(@CurrentUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountDetail(user, id);
  }
}
