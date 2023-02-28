import { gql } from '@afosto/graphql-client';

const confirmCartMutation = gql`
  mutation ConfirmCart($confirm_cart_input: ConfirmCartInput!) {
    confirmCart(input: $confirm_cart_input) {
      order {
        id
        number
        options {
          proceeding_step {
            is_action_required
            proceeding {
              action
              options {
                type
                method
                url
              }
            }
          }
        }
      }
    }
  }
`;

export default confirmCartMutation;
