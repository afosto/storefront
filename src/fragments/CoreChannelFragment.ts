import { gql } from '@afosto/graphql-client';
import { CoreAddressFragment, type CoreAddress } from './CoreAddressFragment';
import { CorePhoneNumberFragment, type CorePhoneNumber } from './CorePhoneNumberFragment';

export interface CoreChannelLink {
  type: string;
  value: string;
}

export interface CoreChannelMessagingFrom {
  email: string;
  name: string;
}

export interface CoreChannelMessaging {
  from: CoreChannelMessagingFrom;
}

export interface CoreChannelBusinessAddressing {
  billing: CoreAddress;
  visiting: CoreAddress;
}

export interface CoreChannelBusinessOpeningWindow {
  start: string;
  end: string;
}

export interface CoreChannelBusinessOpening {
  dayOfWeek: string;
  windows: CoreChannelBusinessOpeningWindow[];
}

export interface CoreChannelBusiness {
  name: string;
  addressing: CoreChannelBusinessAddressing;
  phoneNumber: CorePhoneNumber;
  openings: CoreChannelBusinessOpening[];
}

export type CoreChannelBrandingStyle = 'STRAIGHT' | 'ROUNDED';

export interface CoreChannelBrandingColors {
  primary: string;
  secondary: string;
  text: string;
  info: string;
  warning: string;
  error: string;
  success: string;
}

export interface CoreChannelBranding {
  colors: CoreChannelBrandingColors;
  style: CoreChannelBrandingStyle;
}

export interface CoreChannelPricing {
  currency: string;
}

export interface CoreChannelOptions {
  isVatShiftingAllowed: boolean;
  isPhoneNumberRequired: boolean;
  isFulfilmentEnabled: boolean;
  isCompanyNameRequired: boolean;
  isVatNumberRequired: boolean;
  isCocNumberRequired: boolean;
  isRmaEnabled: boolean;
  isSharedOrganisationRequired: boolean;
  isPrepaidBlocked: boolean;
  isCheckingSpendingLimit: boolean;
  isB2bExcluded: boolean;
  isB2cExcluded: boolean;
  isProjectRequired: boolean;
}

export interface CoreChannel {
  id: string;
  name: string;
  description: string;
  logo: string;
  locale: string;
  favicon: string;
  links: CoreChannelLink[];
  messaging: CoreChannelMessaging;
  business: CoreChannelBusiness;
  branding: CoreChannelBranding;
  pricing: CoreChannelPricing;
  options: CoreChannelOptions;
}

export const CoreChannelFragment = gql`
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
    messaging {
      from {
        email
        name
      }
    }
    business {
      name
      messaging {
        type
        sender {
          address
          name
        }
      }
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
    pricing {
      currency
    }
    options {
      is_vat_shifting_allowed
      is_phone_number_required
      is_fulfilment_enabled
      is_company_name_required
      is_vat_number_required
      is_coc_number_required
      is_b2b_excluded
      is_b2c_excluded
      is_project_required
      is_rma_enabled
      is_shared_organisation_required
      is_prepaid_blocked
      is_checking_spending_limit
    }
  }
`;
