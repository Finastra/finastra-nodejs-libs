import { Resolver, Args, ResolveField, Parent, Context } from '@nestjs/graphql';
import { CorporateAccountsService } from '../corporate-accounts.service';
import { CurrentUser } from '../decorators';
import { FieldsArgs } from '../decorators/fields-args.decorator';

@Resolver('AccountBasic')
export class AccountBasicResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @ResolveField()
  async balances(@CurrentUser() user: any, @Parent() accounts) {
    const { id } = accounts;
    return this.accountsService.getAccountBalance(user, id);
  }

  @ResolveField()
  async statement(
    @CurrentUser() user: any,
    @Parent() accounts,
    @FieldsArgs('accounts') args: any, // @Args should work, this is a workaround for the time being
    @Args('fromDate') fromDate: string,
    @Args('toDate') toDate: string,
    @Args('statementLimit') statementLimit: number,
    @Args('statementOffset') statementOffset: number,
    @Context() ctx: any,
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
    if (!statementOffset) {
      statementOffset = args.statementOffset || 0;
    }

    const { id } = accounts;
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
