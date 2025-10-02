import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment, type CoreAddress } from './CoreAddressFragment';
import { CorePhoneNumberFragment, type CorePhoneNumber } from './CorePhoneNumberFragment';
import { CoreRegistrationFragment, type CoreRegistration } from './CoreRegistrationFragment';

export interface CoreAccountAddress extends CoreAddress {
  id: string;
}

export interface CoreAccountBillingAddress extends CoreAccountAddress {
  isValid: boolean;
  errors: string[];
}

export interface CoreAccountShippingAddress extends CoreAccountAddress {
  isValid: boolean;
  errors: string[];
}

export type CoreAccountOrganisationType = 'DEFAULT' | 'SHARED';

export interface CoreAccountOrganisationAddressingBilling {
  primary: CoreAccountAddress;
  secondary: CoreAccountAddress[];
}

export interface CoreAccountOrganisationAddressingShipping {
  primary: CoreAccountAddress;
  secondary: CoreAccountAddress[];
}

export interface CoreAccountOrganisationAddressing {
  billing: CoreAccountOrganisationAddressingBilling;
  shipping: CoreAccountOrganisationAddressingShipping;
}

export interface CoreAccountOrganisationAdministration {
  email: string;
}

export interface CoreAccountOrganisationPhoneNumbers {
  primary: CorePhoneNumber;
  secondary: CorePhoneNumber[];
}

export interface CoreAccountOrganisation {
  id: string;
  type: CoreAccountOrganisationType;
  avatar: string;
  cocNumber: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  number: string;
  addressing: CoreAccountOrganisationAddressing;
  administration: CoreAccountOrganisationAdministration;
  phoneNumbers: CoreAccountOrganisationPhoneNumbers;
  registration: CoreRegistration;
}

export interface CoreAccount {
  email: string;
  givenName: string;
  additionalName: string;
  familyName: string;
  createdAt: number;
  updatedAt: number;
  billing: CoreAccountBillingAddress[];
  shipping: CoreAccountShippingAddress[];
  organisations: CoreAccountOrganisation[];
  phoneNumbers: CorePhoneNumber[];
  sharedOrganisations: CoreAccountOrganisation[];
}

export const CoreAccountFragment = gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
  ${CoreRegistrationFragment}
  fragment CoreAccountFragment on Account {
    email
    given_name
    additional_name
    family_name
    created_at
    updated_at
    billing {
      id
      ...CoreAddressFragment
      is_valid
      errors
    }
    shipping {
      id
      ...CoreAddressFragment
      is_valid
      errors
    }
    organisations {
      id
      type
      avatar
      coc_number
      created_at
      updated_at
      name
      number
      addressing {
        billing {
          primary {
            id
            ...CoreAddressFragment
          }
          secondary {
            id
            ...CoreAddressFragment
          }
        }
      }
      administration {
        email
      }
      phone_numbers {
        primary {
          ...CorePhoneNumberFragment
        }
        secondary {
          ...CorePhoneNumberFragment
        }
      }
      registration {
        ...CoreRegistrationFragment
      }
    }
    phone_numbers {
      ...CorePhoneNumberFragment
    }
    shared_organisations {
      id
      type
      avatar
      coc_number
      created_at
      updated_at
      name
      number
      addressing {
        billing {
          primary {
            id
            ...CoreAddressFragment
          }
          secondary {
            id
            ...CoreAddressFragment
          }
        }
        shipping {
          primary {
            id
            ...CoreAddressFragment
          }
          secondary {
            id
            ...CoreAddressFragment
          }
        }
      }
      administration {
        email
      }
      phone_numbers {
        primary {
          id
          ...CorePhoneNumberFragment
        }
        secondary {
          id
          ...CorePhoneNumberFragment
        }
      }
      registration {
        ...CoreRegistrationFragment
      }
    }
  }
`;
