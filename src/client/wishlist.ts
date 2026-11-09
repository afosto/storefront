import {
  addItemToWishlistMutation,
  type AddItemToWishlistInput,
  type AddItemToWishlistResponse,
  createWishlistMutation,
  type CreateWishlistInput,
  type CreateWishlistResponse,
  deleteWishlistMutation,
  type DeleteWishlistInput,
  type DeleteWishlistResponse,
  removeItemFromWishlistMutation,
  type RemoveItemFromWishlistInput,
  type RemoveItemFromWishlistResponse,
  type RemoveWishlistItemIdentifier,
  updateWishlistMutation,
  type UpdateWishlistInput,
  type UpdateWishlistResponse,
} from '../mutations';
import { getWishlistQuery, type GetWishlistParams, type GetWishlistResponse } from '../queries';
import type { WishlistToken } from '../types';
import { getExpiresAtFromDays } from '../utils';
import type { ClientContext } from './context';

export const createWishlistClient = ({ config, request, wishlistToken: store }: ClientContext) => {
  /**
   * Create a wishlist
   */
  const createWishlist = async ({
    label,
    expiresAt,
  }: {
    label?: CreateWishlistInput['wishlistInput']['label'];
    expiresAt?: CreateWishlistInput['wishlistInput']['expiresAt'];
  } = {}) => {
    const response = await request<CreateWishlistResponse, CreateWishlistInput>(
      createWishlistMutation,
      {
        wishlistInput: {
          label: label || config.wishlistDefaultLabel,
          expiresAt: expiresAt || getExpiresAtFromDays(config.wishlistDefaultExpiresInDays),
        },
      },
    );

    const createdWishlist = response?.createWishlist?.wishlist || null;

    if (createdWishlist?.token) {
      store.storeInStorage(createdWishlist?.token);
    }

    return createdWishlist;
  };

  /**
   * Get a wishlist
   */
  const getWishlist = async (wishlistToken?: WishlistToken) => {
    try {
      const currentWishlistToken = wishlistToken || store.token;

      if (!currentWishlistToken) {
        return null;
      }

      const response = await request<GetWishlistResponse, GetWishlistParams>(getWishlistQuery, {
        token: currentWishlistToken as string,
      });

      return response?.wishlist || null;
    } catch (error) {
      return store.handleError(error, wishlistToken, async () => null);
    }
  };

  /**
   * Update a wishlist
   */
  const updateWishlist = async (
    { label, expiresAt }: Omit<UpdateWishlistInput['wishlistInput'], 'token'>,
    wishlistToken?: WishlistToken,
  ): Promise<UpdateWishlistResponse['updateWishlist']['wishlist']> => {
    const currentWishlistToken = wishlistToken || store.token;

    if (!currentWishlistToken) {
      return Promise.reject(new Error('No wishlist to update'));
    }

    const response = await request<UpdateWishlistResponse, UpdateWishlistInput>(
      updateWishlistMutation,
      {
        wishlistInput: {
          token: currentWishlistToken as string,
          label,
          expiresAt,
        },
      },
    );

    return response?.updateWishlist?.wishlist || null;
  };

  /**
   * Delete a wishlist
   */
  const deleteWishlist = async (wishlistToken?: WishlistToken) => {
    try {
      const currentWishlistToken = wishlistToken || store.token;

      if (!currentWishlistToken) {
        return Promise.reject(new Error('No wishlist token provided'));
      }

      const response = await request<DeleteWishlistResponse, DeleteWishlistInput>(
        deleteWishlistMutation,
        {
          wishlistInput: {
            token: currentWishlistToken as string,
          },
        },
      );

      return response?.deleteWishlist?.success || null;
    } catch (error) {
      return store.handleError(error, wishlistToken, async () => Promise.reject(error));
    }
  };

  /**
   * Add an item to a wishlist
   */
  const addWishlistItem = async (
    item: Omit<AddItemToWishlistInput['wishlistInput'], 'token'>,
    wishlistToken?: WishlistToken,
  ): Promise<AddItemToWishlistResponse['addItemToWishlist']['wishlist']> => {
    try {
      let currentWishlistToken = wishlistToken || store.token;

      if (!currentWishlistToken && config.autoCreateWishlist) {
        const createdWishlist = await createWishlist();

        if (createdWishlist) {
          currentWishlistToken = createdWishlist.token;
        }
      }

      const response = await request<AddItemToWishlistResponse, AddItemToWishlistInput>(
        addItemToWishlistMutation,
        {
          wishlistInput: {
            ...item,
            expiresAt: item.expiresAt || getExpiresAtFromDays(config.wishlistDefaultExpiresInDays),
            token: currentWishlistToken as string,
          },
        },
      );

      return response?.addItemToWishlist?.wishlist || null;
    } catch (error) {
      return store.handleError(error, wishlistToken, async (wishlistNotFound: boolean) => {
        if (wishlistNotFound) {
          return addWishlistItem(item);
        }

        return Promise.reject(error);
      });
    }
  };

  /**
   * Remove an item from a wishlist.
   * Pass the item's id ({ id }) to remove exactly that item. A sku (as a string or { sku }) only
   * finds an item that was added without meta data.
   */
  const removeWishlistItem = async (
    item: RemoveWishlistItemIdentifier | string,
    wishlistToken?: WishlistToken,
  ) => {
    try {
      const currentWishlistToken = wishlistToken || store.token;

      if (!currentWishlistToken) {
        return Promise.reject(new Error('No wishlist token provided'));
      }

      const { id, sku } = typeof item === 'string' ? { id: undefined, sku: item } : item || {};

      if (!id && !sku) {
        return Promise.reject(new Error('Provide an id or a sku to remove'));
      }

      const response = await request<RemoveItemFromWishlistResponse, RemoveItemFromWishlistInput>(
        removeItemFromWishlistMutation,
        {
          wishlistInput: {
            ...(id ? { id } : { sku: sku as string }),
            token: currentWishlistToken as string,
          },
        },
      );

      return response?.removeItemFromWishlist?.wishlist || null;
    } catch (error) {
      return store.handleError(error, wishlistToken, async () => Promise.reject(error));
    }
  };

  return {
    addWishlistItem,
    createWishlist,
    deleteWishlist,
    getWishlist,
    getWishlistTokenFromStorage: store.readFromStorage,
    removeWishlistItem,
    removeWishlistTokenFromStorage: store.removeFromStorage,
    storeWishlistTokenInStorage: store.storeInStorage,
    updateWishlist,
  };
};
