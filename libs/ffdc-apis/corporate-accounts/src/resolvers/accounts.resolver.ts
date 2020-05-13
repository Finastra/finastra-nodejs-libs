import { Resolver, Query, Args } from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';

@Resolver('AccountBasicRes')
export class CorporateAccountResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async accounts(
    @CurrentUser() user: any,
    @Args('limit') limit = 10,
    @Args('offset') offset = 0,
  ) {
    return this.accountsService.getAccounts(user, limit, offset);
  }
}
