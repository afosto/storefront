import { gql } from '@afosto/graphql-client';
import CoreAddressFragment from './CoreAddressFragment.js';
import CorePhoneNumberFragment from './CorePhoneNumberFragment.js';

const CoreChannelFragment = gql`
  ${CoreAddressFragment}
  ${CorePhoneNumberFragment}
  fragment CoreChannelFragment on Channel {
    id
    name
    description
    logo
    locale
    favicon
    links {
      type
      value
    }
    business {
      name
      addressing {
        billing {
          ...CoreAddressFragment
        }
        visiting {
          ...CoreAddressFragment
        }
      }
      phone_number {
        ...CorePhoneNumberFragment
      }
      openings {
        day_of_week
        windows {
          start
          end
        }
      }
    }
    branding {
      colors {
        primary
        secondary
        text
        info
        warning
        error
        success
      }
      style
    }
  }
`;

export default CoreChannelFragment;
