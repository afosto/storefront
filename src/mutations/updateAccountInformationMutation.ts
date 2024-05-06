import { gql } from '@afosto/graphql-client';
import { CoreAccountFragment } from '../fragments';

export const updateAccountInformationMutation = gql`
  ${CoreAccountFragment}
  mutation UpdateAccountInformationMutation($update_account_information_input: UpdateAccountInput!) {
    updateAccount(input: $update_account_information_input) {
      account {
        ...CoreAccountFragment
      }
    }
  }
`;
