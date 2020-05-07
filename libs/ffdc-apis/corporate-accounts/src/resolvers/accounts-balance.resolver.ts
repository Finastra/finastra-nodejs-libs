import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';
import { AccountType } from '../interfaces';

@Resolver('AccountwBalanceRes')
export class AccountsBalanceResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async accountsBalance(
    @CurrentUser() user: any,
    @Args('accountType') accountType: AccountType,
    @Args('limit') limit = 10,
    @Args('offset') offset = 0,
    @Args('equivalentCurrency') equivalentCurrency: string,
  ) {
    return this.accountsService.getAccountsDetails(
      user,
      accountType,
      limit,
      offset,
      equivalentCurrency,
    );
  }
}
