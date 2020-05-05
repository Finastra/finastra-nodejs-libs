import { Injectable, Request as NestRequest, UseGuards } from '@nestjs/common';
import { Resolver, Query, Context, Args } from '@nestjs/graphql';
import { Public } from '@ffdc/nestjs-oidc';
import { CorporateAccountsService } from './corporate-accounts.service';
import { GqlUser } from './decorators';
import { AccountType } from './graphql';

@Resolver('CorporateAccount')
export class CorporateAccountResolver {
  constructor(private readonly accountsService: CorporateAccountsService) {}

  @Query()
  @Public()
  async getAccounts(
    @GqlUser() user: any,
    @Args('balance') balance: boolean,
    @Args('limit') limit = 10,
    @Args('offset') offset = 0,
  ) {
    return this.accountsService.getAccounts(user, balance, limit, offset);
  }

  @Query()
  @Public()
  async getAccountsBalances(
    @GqlUser() user: any,
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
  @Public()
  async account(@GqlUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountDetail(user, id);
  }

  @Query()
  @Public()
  async accountBalance(@GqlUser() user: any, @Args('id') id: string) {
    return this.accountsService.getAccountBalance(user, id);
  }
}
