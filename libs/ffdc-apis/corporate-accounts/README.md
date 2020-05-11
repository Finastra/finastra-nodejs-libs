# Corporate Accounts Helpers

Here are some helpers for the [Accounts & Balances APIs](https://developer.fusionfabric.cloud/api/corporate-accounteinfo-me-v1-831cb09d-cc10-4772-8ed5-8a6b72ec8e01/docs#operation/getAccountsForCustomerUser) from Corporate Banking

## Interfaces for frontend usage

```typescript
import {
  AccountDetail,
  AccountType,
  AccountStatement,
} from '@ffdc/api_corporate-accounts/interfaces';
```

When the importing the interfaces from a frontend only application, be sure to preprend by `/interfaces`.

## GraphQL setup

`configs/graphql-config.service.ts`

```typescript
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { CorporateAccountsModule } from '@ffdc/api_corporate-accounts';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): GqlModuleOptions {
    const playgroundDevOptions = {
      settings: {
        'request.credentials': 'include',
      },
    };
    return {
      typePaths: ['./node_modules/@ffdc/api_corporate-accounts/**/*.graphql'],
      include: [CorporateAccountsModule],
      playground:
        process.env.NODE_ENV === 'production' ? false : playgroundDevOptions,
    };
  }
}
```

`app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { CorporateAccountsModule } from '@ffdc/api_corporate-accounts';
import { GqlConfigService } from './configs/graphql-config.service';

@Module({
  imports: [
    CorporateAccountsModule,
    GraphQLModule.forRootAsync({
      useClass: GqlConfigService,
    }),
  ],
})
export class AppModule {}
```

## Example GQL queries

### Get accounts

```graphql
query {
  accounts(
    limit: 10
    offset: 7
    fromDate: "2018-01-03"
    toDate: "2020-03-05"
    statementLimit: 1
  ) {
    items {
      id
      number
      type
      currency
      balances {
        availableBalance
      }
      statement {
        items {
          amount
        }
      }
    }
    _meta {
      itemCount
    }
  }
}
```

### Get accounts with details and balance

```graphql
query {
  accountsBalance(
    accountType: CURRENT
    equivalentCurrency: "EUR"
    fromDate: "2018-01-03"
    toDate: "2020-03-05"
  ) {
    items {
      id
      type
      currency
      availableBalance
      availableBalanceEquivalent
      equivalentCurrency
      details {
        number
        country
        bankShortName
      }
      statement {
        items {
          amount
        }
      }
    }
    _meta {
      itemCount
    }
  }
}
```

### Get specific account detail

```graphql
query($accountId: ID!) {
  account(id: $accountId) {
    id
    currency
    cutomerReference
  }
}
```

### Get specific account balances

```graphql
query($accountId: ID!) {
  accountBalance(id: $accountId) {
    id
    currency
    availableBalance
  }
}
```

### Get specific account statement

```graphql
query($accountId: ID!) {
  accountStatement(
    id: $accountId
    fromDate: "2018-01-03"
    toDate: "2020-03-05"
  ) {
    items {
      currency
      balance
      amount
      postingDate
      valueDate
      transactionType
    }
    _meta {
      itemCount
    }
  }
}
```
