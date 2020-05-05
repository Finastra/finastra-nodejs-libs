# Corporate Accounts Helpers

Here are some helpers for the [Accounts & Balances APIs](https://developer.fusionfabric.cloud/api/corporate-accounteinfo-me-v1-831cb09d-cc10-4772-8ed5-8a6b72ec8e01/docs#operation/getAccountsForCustomerUser) from Corporate Banking

## Example queries

### Get accounts

```graphql
query {
  getAccounts(limit: 10, offset: 0) {
    id
    number
    type
    currency
    balances {
      availableBalance
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

## TODO:

- Account statements
- Unit tests
- Documentation
- non graphQL usage
- enable ffdc tenant switching ?
