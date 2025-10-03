import { gql } from '@afosto/graphql-client';
import { CoreChannelFragment } from '../fragments/CoreChannelFragment';
import type { Channel } from '../types';

export interface GetChannelParams {
  id?: string;
}

export interface GetChannelResponse {
  channel: Channel;
}

export const getChannelQuery = gql`
  ${CoreChannelFragment}
  query GetChannel($id: String) {
    channel(id: $id) {
      ...CoreChannelFragment
    }
  }
`;
