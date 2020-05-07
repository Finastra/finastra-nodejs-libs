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

@Resolver('AccountStatementRes')
export class AccountStatementResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

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
