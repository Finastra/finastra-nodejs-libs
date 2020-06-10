import { Resolver, Query, Args } from '@nestjs/graphql';
import { CorporateAccountsService } from '../services';
import { CurrentUser } from '../decorators';

@Resolver('AccountBalance')
export class AccountBalanceResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async accountBalance(@CurrentUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountBalance(user, id);
  }
}
