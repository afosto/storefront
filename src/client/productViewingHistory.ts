import {
  addItemToProductViewingHistoryMutation,
  type AddItemToProductViewingHistoryInput,
  type AddItemToProductViewingHistoryResponse,
  createProductViewingHistoryMutation,
  type CreateProductViewingHistoryInput,
  type CreateProductViewingHistoryResponse,
  deleteProductViewingHistoryMutation,
  type DeleteProductViewingHistoryInput,
  type DeleteProductViewingHistoryResponse,
  updateProductViewingHistoryMutation,
  type UpdateProductViewingHistoryInput,
  type UpdateProductViewingHistoryResponse,
} from '../mutations';
import {
  getProductViewingHistoryQuery,
  type GetProductViewingHistoryParams,
  type GetProductViewingHistoryResponse,
} from '../queries';
import type { ProductViewingHistoryToken } from '../types';
import { getExpiresAtFromDays } from '../utils';
import type { ClientContext } from './context';

export const createProductViewingHistoryClient = ({
  config,
  request,
  productViewingHistoryToken: store,
}: ClientContext) => {
  /**
   * Create a product viewing history
   */
  const createProductViewingHistory = async ({
    label,
    expiresAt,
  }: {
    label?: CreateProductViewingHistoryInput['productViewingHistoryInput']['label'];
    expiresAt?: CreateProductViewingHistoryInput['productViewingHistoryInput']['expiresAt'];
  } = {}) => {
    const response = await request<
      CreateProductViewingHistoryResponse,
      CreateProductViewingHistoryInput
    >(createProductViewingHistoryMutation, {
      productViewingHistoryInput: {
        label: label || config.productViewingHistoryDefaultLabel,
        expiresAt:
          expiresAt || getExpiresAtFromDays(config.productViewingHistoryDefaultExpiresInDays),
      },
    });

    const createdProductViewingHistory =
      response?.createProductViewingHistory?.productViewingHistory || null;

    if (createdProductViewingHistory?.token) {
      store.storeInStorage(createdProductViewingHistory?.token);
    }

    return createdProductViewingHistory;
  };

  /**
   * Get a product viewing history
   */
  const getProductViewingHistory = async (
    productViewingHistoryToken: ProductViewingHistoryToken,
  ) => {
    try {
      const currentProductViewingHistoryToken = productViewingHistoryToken || store.token;

      if (!currentProductViewingHistoryToken) {
        return null;
      }
      const response = await request<
        GetProductViewingHistoryResponse,
        GetProductViewingHistoryParams
      >(getProductViewingHistoryQuery, {
        token: currentProductViewingHistoryToken,
      });

      return response?.productViewingHistory || null;
    } catch (error) {
      return store.handleError(error, productViewingHistoryToken, async () => null);
    }
  };

  /**
   * Update a product viewing history
   */
  const updateProductViewingHistory = async (
    {
      label,
      expiresAt,
    }: Omit<UpdateProductViewingHistoryInput['productViewingHistoryInput'], 'token'>,
    productViewingHistoryToken?: ProductViewingHistoryToken,
  ): Promise<
    UpdateProductViewingHistoryResponse['updateProductViewingHistory']['productViewingHistory']
  > => {
    const currentProductViewingHistoryToken = productViewingHistoryToken || store.token;

    if (!currentProductViewingHistoryToken) {
      return Promise.reject(new Error('No product viewing history to update'));
    }

    const response = await request<
      UpdateProductViewingHistoryResponse,
      UpdateProductViewingHistoryInput
    >(updateProductViewingHistoryMutation, {
      productViewingHistoryInput: {
        token: currentProductViewingHistoryToken as string,
        label,
        expiresAt,
      },
    });

    return response?.updateProductViewingHistory?.productViewingHistory || null;
  };

  /**
   * Delete a product viewing history
   */
  const deleteProductViewingHistory = async (
    productViewingHistoryToken: ProductViewingHistoryToken,
  ) => {
    try {
      const currentProductViewingHistoryToken = productViewingHistoryToken || store.token;

      if (!currentProductViewingHistoryToken) {
        return Promise.reject(new Error('No product viewing history token provided'));
      }

      const response = await request<
        DeleteProductViewingHistoryResponse,
        DeleteProductViewingHistoryInput
      >(deleteProductViewingHistoryMutation, {
        productViewingHistoryInput: {
          token: currentProductViewingHistoryToken as string,
        },
      });

      return response?.deleteProductViewingHistory?.success || null;
    } catch (error) {
      return store.handleError(error, productViewingHistoryToken, async () =>
        Promise.reject(error),
      );
    }
  };

  /**
   * Add an item to a product viewing history
   */
  const addProductViewingHistoryItem = async (
    item: Omit<AddItemToProductViewingHistoryInput['productViewingHistoryInput'], 'token'>,
    productViewingHistoryToken: ProductViewingHistoryToken,
  ) => {
    let currentProductViewingHistoryToken = productViewingHistoryToken || store.token;

    if (!currentProductViewingHistoryToken && config.autoCreateProductViewingHistory) {
      const createdProductViewingHistory = await createProductViewingHistory();

      if (createdProductViewingHistory) {
        currentProductViewingHistoryToken = createdProductViewingHistory.token;
      }
    }

    const response = await request<
      AddItemToProductViewingHistoryResponse,
      AddItemToProductViewingHistoryInput
    >(addItemToProductViewingHistoryMutation, {
      productViewingHistoryInput: {
        ...item,
        expiresAt:
          item.expiresAt || getExpiresAtFromDays(config.productViewingHistoryDefaultExpiresInDays),
        token: currentProductViewingHistoryToken as string,
      },
    });

    return response?.addItemToProductViewingHistory?.productViewingHistory || null;
  };

  return {
    addProductViewingHistoryItem,
    createProductViewingHistory,
    deleteProductViewingHistory,
    getProductViewingHistory,
    getProductViewingHistoryTokenFromStorage: store.readFromStorage,
    removeProductViewingHistoryTokenFromStorage: store.removeFromStorage,
    storeProductViewingHistoryTokenInStorage: store.storeInStorage,
    updateProductViewingHistory,
  };
};
