import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';

@Resolver('AccountBasicRes')
export class CorporateAccountResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async accounts(
    @CurrentUser() user: any,
    @Args('bla') bla: string,
    @Args('limit') limit = 10,
    @Args('offset') offset = 0,
  ) {
    return this.accountsService.getAccounts(user, limit, offset);
  }
}
