import { gql } from '@afosto/graphql-client';
import { CoreSharedContactFragment, type CoreSharedContact } from '../fragments/CoreSharedContactFragment';
import type { OrganisationType } from '../types';

export interface AccountOrganisationUsersSharedOrganisation {
  id: string;
  type: OrganisationType;
  sharedContacts: CoreSharedContact[];
}

export interface GetAccountOrganisationUsersResponse {
  account: {
    sharedOrganisations: AccountOrganisationUsersSharedOrganisation[];
  };
}

export const getAccountOrganisationUsersQuery = gql`
  ${CoreSharedContactFragment}
  query GetAccountOrganisationUsers {
    account {
      shared_organisations {
        id
        type
        shared_contacts {
          ...CoreSharedContactFragment
        }
      }
    }
  }
`;
