import {
  type CreateAccountRmaInput,
  type CreateAccountRmaItemsInput,
  createAccountRmaItemsMutation,
  type CreateAccountRmaItemsResponse,
  createAccountRmaMutation,
  type CreateAccountRmaResponse,
  type CreateAccountRmaWithItemsInput,
  createAccountRmaWithItemsMutation,
  type CreateAccountRmaWithItemsResponse,
  type DeleteAccountRmaInput,
  type DeleteAccountRmaItemsInput,
  deleteAccountRmaItemsMutation,
  type DeleteAccountRmaItemsResponse,
  deleteAccountRmaMutation,
  type DeleteAccountRmaResponse,
  type UpdateAccountRmaInput,
  type UpdateAccountRmaItemsInput,
  updateAccountRmaItemsMutation,
  type UpdateAccountRmaItemsResponse,
  updateAccountRmaMutation,
  type UpdateAccountRmaResponse,
} from '../mutations';
import {
  type GetAccountRmaParams,
  getAccountRmaQuery,
  type GetAccountRmaResponse,
  type GetAccountRmasParams,
  getAccountRmasQuery,
  type GetAccountRmasResponse,
  type SearchAccountRmaItemsParams,
  searchAccountRmaItemsQuery,
  type SearchAccountRmaItemsResponse,
} from '../queries';
import { uuid } from '../utils';
import type { ClientContext } from './context';

export const createRmaClient = ({ authenticatedRequest }: ClientContext) => {
  /**
   * Create a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const createAccountRma = async (
    input: CreateAccountRmaWithItemsInput['input'] & {
      items?: CreateAccountRmaWithItemsInput['itemsInput']['items'];
    } = {},
  ) => {
    const { id, items = [], ...otherInput } = input || {};

    if (items.length > 0) {
      const rmaId = id ?? uuid();
      const response = await authenticatedRequest<
        CreateAccountRmaWithItemsResponse,
        CreateAccountRmaWithItemsInput
      >(createAccountRmaWithItemsMutation, {
        input: {
          ...otherInput,
          id: rmaId,
        },
        itemsInput: {
          rmaId,
          items,
        },
      });
      return response?.createRmaItems?.rma || null;
    }

    const response = await authenticatedRequest<CreateAccountRmaResponse, CreateAccountRmaInput>(
      createAccountRmaMutation,
      {
        input: {
          ...otherInput,
          id,
        },
      },
    );
    return response?.createRma?.rma || null;
  };

  /**
   * Delete a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const deleteAccountRma = async (id: DeleteAccountRmaInput['input']['id']) => {
    const response = await authenticatedRequest<DeleteAccountRmaResponse, DeleteAccountRmaInput>(
      deleteAccountRmaMutation,
      {
        input: {
          id,
        },
      },
    );
    return response?.deleteRma?.isSuccessful || false;
  };

  /**
   * Get the Return Merchandise Authorizations (RMAs) for the user that is logged in.
   */
  const getAccountRmas = async (query: GetAccountRmasParams = {}) => {
    const response = await authenticatedRequest<GetAccountRmasResponse, GetAccountRmasParams>(
      getAccountRmasQuery,
      {
        ...query,
        filters: query?.filters ?? {},
      },
    );
    const rmasResponse = response?.rmas || {};
    const rmas = rmasResponse.nodes || [];
    const pageInfo = rmasResponse.pageInfo || {};

    return {
      rmas,
      pageInfo,
    };
  };

  /**
   * Get a Return Merchandise Authorization (RMA) by ID for the user that is logged in.
   */
  const getAccountRma = async (id: GetAccountRmaParams['id']) => {
    const response = await authenticatedRequest<GetAccountRmaResponse, GetAccountRmaParams>(
      getAccountRmaQuery,
      {
        id,
      },
    );
    return response?.rma || null;
  };

  /**
   * Update a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const updateAccountRma = async (input: UpdateAccountRmaInput['input']) => {
    const response = await authenticatedRequest<UpdateAccountRmaResponse, UpdateAccountRmaInput>(
      updateAccountRmaMutation,
      {
        input: input || {},
      },
    );

    return response?.updateRma?.rma || null;
  };

  /**
   * Create items for a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const createAccountRmaItems = async (input: CreateAccountRmaItemsInput['input']) => {
    const response = await authenticatedRequest<
      CreateAccountRmaItemsResponse,
      CreateAccountRmaItemsInput
    >(createAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.createRmaItems?.rma || null;
  };

  /**
   * Delete items of a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const deleteAccountRmaItems = async (input: DeleteAccountRmaItemsInput['input']) => {
    const response = await authenticatedRequest<
      DeleteAccountRmaItemsResponse,
      DeleteAccountRmaItemsInput
    >(deleteAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.deleteRmaItems?.rma || null;
  };

  /**
   * Search for available items that can be added to a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const searchAccountRmaItems = async (query: SearchAccountRmaItemsParams = {}) => {
    const response = await authenticatedRequest<
      SearchAccountRmaItemsResponse,
      SearchAccountRmaItemsParams
    >(searchAccountRmaItemsQuery, {
      ...query,
      filters: query?.filters ?? {},
    });
    const searchRmaItemsResponse = response?.searchRmaItems || {};
    const items = searchRmaItemsResponse.nodes || [];
    const pageInfo = searchRmaItemsResponse.pageInfo || {};

    return {
      items,
      pageInfo,
    };
  };

  /**
   * Update items for a Return Merchandise Authorization (RMA) for the user that is logged in.
   */
  const updateAccountRmaItems = async (input: UpdateAccountRmaItemsInput['input']) => {
    const response = await authenticatedRequest<
      UpdateAccountRmaItemsResponse,
      UpdateAccountRmaItemsInput
    >(updateAccountRmaItemsMutation, {
      input: input || {},
    });
    return response?.updateRmaItems?.rma || null;
  };

  return {
    createAccountRma,
    createAccountRmaItems,
    deleteAccountRma,
    deleteAccountRmaItems,
    getAccountRma,
    getAccountRmas,
    searchAccountRmaItems,
    updateAccountRma,
    updateAccountRmaItems,
  };
};
