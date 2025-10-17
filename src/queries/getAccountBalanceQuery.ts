import { gql } from '@afosto/graphql-client';

export interface AccountBalance {
  availableBalance: number;
  spendingLimit: number;
  usedBalance: number;
}

export interface GetAccountBalanceResponse {
  account: {
    balance: AccountBalance;
  };
}
export const getAccountBalanceQuery = gql`
  query GetAccountBalance {
    account {
      balance {
        available_balance
        spending_limit
        used_balance
      }
    }
  }
`;
