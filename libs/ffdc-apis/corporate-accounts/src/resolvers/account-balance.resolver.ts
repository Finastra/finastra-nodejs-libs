import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';

@Resolver('AccountBalance')
export class AccountBalanceResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  async accountBalance(@CurrentUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountBalance(user, id);
  }
}
