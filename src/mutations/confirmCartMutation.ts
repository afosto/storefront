import { gql } from '@afosto/graphql-client';

export interface ConfirmCartInput {
  confirmCartInput: {
    cartId: string;
    checkout?: {
      successReturnUrl?: string;
      failureReturnUrl?: string;
    };
  };
}

export interface ConfirmCartResponseOrderOptionsProceedingStepProceedingOption {
  type: string;
  method: string;
  url: string;
}

export interface ConfirmCartResponseOrderOptionsProceedingStepProceeding {
  action: string;
  options: ConfirmCartResponseOrderOptionsProceedingStepProceedingOption[];
}

export interface ConfirmCartResponseOrderOptionsProceedingStep {
  isActionRequired: boolean;
  proceeding: ConfirmCartResponseOrderOptionsProceedingStepProceeding;
}

export interface ConfirmCartResponseOrderOptions {
  proceedingStep: ConfirmCartResponseOrderOptionsProceedingStep;
}

export interface ConfirmCartResponseOrder {
  id: string;
  number: string;
  billing: {
    payment: {
      method: {
        code: string;
      };
    };
  };
  options: ConfirmCartResponseOrderOptions;
}

export interface ConfirmCartResponse {
  confirmCart: {
    order: ConfirmCartResponseOrder;
  };
}

export const confirmCartMutation = gql`
  mutation ConfirmCart($confirm_cart_input: ConfirmCartInput!) {
    confirmCart(input: $confirm_cart_input) {
      order {
        id
        number
        billing {
          payment {
            method {
              code
            }
          }
        }
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
