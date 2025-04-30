import { gql } from '@afosto/graphql-client';

export const CoreRmaFragment = gql`
  fragment CoreRmaFragment on Rma {
    id
    number
    status
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
    organisation {
      id
      number
      name
      administration {
        email
      }
      phone_numbers {
        primary {
          id
          country_code
          national
          number
        }
      }
    }
    address {
      country_code
      administrative_area
      locality
      postal_code
      address_line_1
      address_line_2
      thoroughfare
      premise_number
      premise_number_suffix
      given_name
      additional_name
      family_name
      organisation
      options {
        format {
          address
        }
      }
    }
    items {
      id
      product {
        sku
        label
        brand
        gtin
        images
        mpn
        filters {
          key
          value
        }
      }
      status
      is_received
      reason
      order {
        id
        number
        currency
      }
      contact_note
      vendor_note
      created_at
      updated_at
    }
    due_at
    created_at
    updated_at
  }
`;
