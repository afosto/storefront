import { gql } from '@afosto/graphql-client';
import { CoreChannelFragment, type CoreChannel } from '../fragments/CoreChannelFragment';

export interface GetChannelParams {
  id?: string;
}

export interface GetChannelResponse {
  channel: CoreChannel;
}

export const getChannelQuery = gql`
  ${CoreChannelFragment}
  query GetChannel($id: String) {
    channel(id: $id) {
      ...CoreChannelFragment
    }
  }
`;
