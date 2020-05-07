import { Resolver, Query, Args } from '@nestjs/graphql';
import { CorporateAccountsService } from './corporate-accounts.service';
import { CurrentUser } from './decorators';
import { AccountType } from './interfaces';

@Resolver('CorporateAccount')
export class CorporateAccountResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async getAccounts(
    @CurrentUser() user: any,
    @Args('balance') balance: boolean,
    @Args('limit') limit = 10,
    @Args('offset') offset = 0,
  ) {
    return this.accountsService.getAccounts(user, balance, limit, offset);
  }

  @Query()
  async getAccountsBalances(
    @CurrentUser() user: any,
    @Args('details') details: boolean,
    @Args('accountType') accountType: AccountType,
    @Args('limit') limit = 10,
    @Args('offset') offset = 0,
    @Args('equivalentCurrency') equivalentCurrency: string,
  ) {
    return this.accountsService.getAccountsDetails(
      user,
      details,
      accountType,
      limit,
      offset,
      equivalentCurrency,
    );
  }

  @Query()
  async account(@CurrentUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountDetail(user, id);
  }

  @Query()
  async accountBalance(@CurrentUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountBalance(user, id);
  }

  @Query()
  async accountStatement(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('fromDate') fromDate: string,
    @Args('toDate') toDate: string,
    @Args('limit') limit: number,
    @Args('offset') offset: number,
  ) {
    return this.accountsService.getAccountStatement(
      user,
      id,
      fromDate,
      toDate,
      limit,
      offset,
    );
  }
}
