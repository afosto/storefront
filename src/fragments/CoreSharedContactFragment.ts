import { gql } from '@afosto/graphql-client';
import type { CorePhoneNumber } from './CorePhoneNumberFragment';

export interface CoreSharedContact {
  role: string;
  contact: {
    id: string;
    number: string;
    email: string;
    givenName: string;
    additionalName: string;
    familyName: string;
    phoneNumbers: {
      primary: CorePhoneNumber;
    };
  }
}

export const CoreSharedContactFragment = gql`
  fragment CoreSharedContactFragment on SharedContact {
    role
    contact {
      id
      number
      email
      given_name
      additional_name
      family_name
      phone_numbers {
        primary {
          id
          country_code
          national
          number
        }
      }
    }
  }
`;
