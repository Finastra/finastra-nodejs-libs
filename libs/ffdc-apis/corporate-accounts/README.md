# Corporate Accounts Helpers

Here are some helpers for the [Accounts & Balances APIs](https://developer.fusionfabric.cloud/api/corporate-accounteinfo-me-v1-831cb09d-cc10-4772-8ed5-8a6b72ec8e01/docs#operation/getAccountsForCustomerUser) from Corporate Banking

## Example queries

### Get accounts

```graphql
query {
  getAccounts(balance: true, limit: 10) {
    items {
      id
      number
      type
      currency
      balances {
        availableBalance
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
  getAccountsBalances(
    accountType: CURRENT
    equivalentCurrency: "EUR"
    details: true
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

## TODO:

- Unit tests
- Documentation
  - non graphQL usage
