import {
  type ApproveStockUpdateSubscriptionInput,
  approveStockUpdateSubscriptionMutation,
  type ApproveStockUpdateSubscriptionResponse,
  type CreateStockUpdateSubscriptionInput,
  createStockUpdateSubscriptionMutation,
  type CreateStockUpdateSubscriptionResponse,
  type RemoveStockUpdateSubscriptionInput,
  removeStockUpdateSubscriptionMutation,
  type RemoveStockUpdateSubscriptionResponse,
} from '../mutations';
import {
  type GetChannelParams,
  getChannelQuery,
  type GetChannelResponse,
  type GetOrderParams,
  getOrderQuery,
  type GetOrderResponse,
} from '../queries';
import type { ClientContext } from './context';

export const createStorefrontDataClient = ({ request }: ClientContext) => {
  /**
   * Get an order by ID
   */
  const getOrder = async (id: GetOrderParams['id']) => {
    const response = await request<GetOrderResponse, GetOrderParams>(getOrderQuery, {
      id,
    });
    return response?.order || null;
  };

  /**
   * Get the channel specific for the storefront token. If an id is provided, it will return the channel with that id.
   */
  const getChannel = async (id?: GetChannelParams['id']) => {
    const response = await request<GetChannelResponse, GetChannelParams>(getChannelQuery, {
      id,
    });
    return response?.channel || null;
  };

  /**
   * Subscribe to stock updates for the given SKU
   */
  const createStockUpdateSubscription = async (
    input: CreateStockUpdateSubscriptionInput['createStockUpdateSubscriptionInput'],
  ) => {
    const response = await request<
      CreateStockUpdateSubscriptionResponse,
      CreateStockUpdateSubscriptionInput
    >(createStockUpdateSubscriptionMutation, {
      createStockUpdateSubscriptionInput: input,
    });

    return response?.createStockUpdateSubscription || null;
  };

  /**
   * Approve a requested stock update subscription
   */
  const approveStockUpdateSubscription = async (
    token: ApproveStockUpdateSubscriptionInput['approveStockUpdateSubscriptionInput']['token'],
  ) => {
    const response = await request<
      ApproveStockUpdateSubscriptionResponse,
      ApproveStockUpdateSubscriptionInput
    >(approveStockUpdateSubscriptionMutation, {
      approveStockUpdateSubscriptionInput: {
        token,
      },
    });
    return response?.approveStockUpdateSubscription || null;
  };

  /**
   * Unsubscribe from stock updates
   */
  const removeStockUpdateSubscription = async (
    token: RemoveStockUpdateSubscriptionInput['removeStockUpdateSubscriptionInput']['token'],
  ) => {
    const response = await request<
      RemoveStockUpdateSubscriptionResponse,
      RemoveStockUpdateSubscriptionInput
    >(removeStockUpdateSubscriptionMutation, {
      removeStockUpdateSubscriptionInput: {
        token,
      },
    });
    return response?.removeStockUpdateSubscription || null;
  };

  return {
    approveStockUpdateSubscription,
    createStockUpdateSubscription,
    getChannel,
    getOrder,
    removeStockUpdateSubscription,
  };
};
