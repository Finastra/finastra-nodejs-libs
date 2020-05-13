import { Resolver, Args, ResolveField, Parent, Context } from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';
import { FieldsArgs } from '../decorators/fields-args.decorator';

@Resolver('AccountwBalance')
export class AccountwBalanceResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @ResolveField()
  async details(@CurrentUser() user: any, @Parent() accounts) {
    const { id } = accounts;
    return this.accountsService.getAccountBalance(user, id);
  }

  @ResolveField()
  async statement(
    @CurrentUser() user: any,
    @Parent() account,
    @FieldsArgs('accounts') args: any, // @Args should work, this is a workaround for the time being
    @Args('fromDate') fromDate: string,
    @Args('toDate') toDate: string,
    @Args('statementLimit') statementLimit: number,
    @Args('statementOffset') statementOffset: number,
  ) {
    if (!fromDate) {
      fromDate = args.fromDate;
    }
    if (!toDate) {
      toDate = args.toDate;
    }
    if (!statementLimit) {
      statementLimit = args.statementLimit || 10;
    }
    if (!statementOffset && statementOffset !== 0) {
      statementOffset = args.statementOffset || 0;
    }

    const { id } = account;
    return this.accountsService.getAccountStatement(
      user,
      id,
      fromDate,
      toDate,
      statementLimit,
      statementOffset,
    );
  }
}
