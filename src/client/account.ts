import {
  type InviteUserToAccountOrganisationInput,
  inviteUserToAccountOrganisationMutation,
  type InviteUserToAccountOrganisationResponse,
  type RemoveUserFromAccountOrganisationInput,
  removeUserFromAccountOrganisationMutation,
  type RemoveUserFromAccountOrganisationResponse,
  type ReorderInput,
  reorderMutation,
  type ReorderResponse,
  type UpdateContactRoleInOrganisationInput,
  updateContactRoleInOrganisationMutation,
  type UpdateContactRoleInOrganisationResponse,
  type UpdateOrganisationOnAccountInput,
  updateOrganisationOnAccountMutation,
  type UpdateOrganisationOnAccountResponse,
} from '../mutations';
import {
  getAccountBalanceQuery,
  type GetAccountBalanceResponse,
  getAccountInformationQuery,
  type GetAccountInformationResponse,
  type GetAccountOrderParams,
  getAccountOrderQuery,
  type GetAccountOrderResponse,
  type GetAccountOrdersParams,
  getAccountOrdersQuery,
  type GetAccountOrdersResponse,
  getAccountOrganisationUsersQuery,
  type GetAccountOrganisationUsersResponse,
  getAccountOutstandingOrdersQuery,
  type GetAccountOutstandingOrdersResponse,
  getAccountProjectsQuery,
  type GetAccountProjectsResponse,
} from '../queries';
import type { AccountOrganisationUser } from '../types';
import type { ClientContext } from './context';

export const createAccountClient = ({
  authenticatedRequest,
  userToken: { getUser },
}: ClientContext) => {
  /**
   * Invite a user to get account access to your organisation
   */
  const inviteUserToAccountOrganisation = async (
    input: Omit<
      InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput'],
      'contact'
    > & {
      user: {
        id?: InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput']['contact']['contactId'];
        email?: InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput']['contact']['email'];
        role: InviteUserToAccountOrganisationInput['inviteUserToAccountOrganisationInput']['contact']['role'];
      };
    },
  ): Promise<{ users: AccountOrganisationUser[] }> => {
    const { organisationId, user } = input || {};

    const response = await authenticatedRequest<
      InviteUserToAccountOrganisationResponse,
      InviteUserToAccountOrganisationInput
    >(inviteUserToAccountOrganisationMutation, {
      inviteUserToAccountOrganisationInput: {
        organisationId,
        contact: {
          contactId: user?.id,
          email: user?.email,
          role: user?.role?.toUpperCase() || 'USER',
        },
      },
    });

    return { users: response?.addContactToAccountOrganisation?.organisation?.sharedContacts || [] };
  };

  /**
   * Update the role of a user in an organisation
   */
  const updateUserRoleInAccountOrganisation = async (
    input: Omit<
      UpdateContactRoleInOrganisationInput['updateContactRoleInOrganisationInput'],
      'contactId'
    > & {
      userId: UpdateContactRoleInOrganisationInput['updateContactRoleInOrganisationInput']['contactId'];
    },
  ): Promise<{ users: AccountOrganisationUser[] }> => {
    const { organisationId, userId, role } = input || {};

    const response = await authenticatedRequest<
      UpdateContactRoleInOrganisationResponse,
      UpdateContactRoleInOrganisationInput
    >(updateContactRoleInOrganisationMutation, {
      updateContactRoleInOrganisationInput: {
        organisationId,
        contactId: userId,
        role: role?.toUpperCase(),
      },
    });

    return { users: response?.updateContactRoleInOrganisation?.organisation?.sharedContacts || [] };
  };

  /**
   * Remove a user with account access from your organisation
   */
  const removeUserFromAccountOrganisation = async (
    input: Omit<
      RemoveUserFromAccountOrganisationInput['removeUserFromAccountOrganisationInput'],
      'contactId'
    > & {
      userId: RemoveUserFromAccountOrganisationInput['removeUserFromAccountOrganisationInput']['contactId'];
    },
  ): Promise<{ users: AccountOrganisationUser[] }> => {
    const { organisationId, userId } = input || {};
    const response = await authenticatedRequest<
      RemoveUserFromAccountOrganisationResponse,
      RemoveUserFromAccountOrganisationInput
    >(removeUserFromAccountOrganisationMutation, {
      removeUserFromAccountOrganisationInput: {
        organisationId,
        contactId: userId,
      },
    });

    return {
      users: response?.removeContactFromAccountOrganisation?.organisation?.sharedContacts || [],
    };
  };

  /**
   * Get the account information of the user that is logged in.
   */
  const getAccountInformation = async () => {
    const response = await authenticatedRequest<GetAccountInformationResponse>(
      getAccountInformationQuery,
    );
    return response?.account || null;
  };

  /**
   * Get the balance of the account of the user that is logged in.
   */
  const getAccountBalance = async () => {
    const response = await authenticatedRequest<GetAccountBalanceResponse>(getAccountBalanceQuery);
    return response?.account?.balance || null;
  };

  /**
   * Get an order by ID for the user that is logged in.
   */
  const getAccountOrder = async (id: GetAccountOrderParams['id']) => {
    const response = await authenticatedRequest<GetAccountOrderResponse, GetAccountOrderParams>(
      getAccountOrderQuery,
      {
        id,
      },
    );
    return response?.account?.order || null;
  };

  /**
   * Get the orders for the user that is logged in.
   */
  const getAccountOrders = async (query: GetAccountOrdersParams = {}) => {
    const response = await authenticatedRequest<GetAccountOrdersResponse, GetAccountOrdersParams>(
      getAccountOrdersQuery,
      {
        first: query?.first,
        after: query?.after,
      },
    );
    const ordersResponse = response?.account?.orders || {};
    const orders = ordersResponse.nodes || [];
    const pageInfo = ordersResponse.pageInfo || {};

    return {
      orders,
      pageInfo,
    };
  };

  /**
   * Get the outstanding orders for the user that is logged in.
   */
  const getAccountOutstandingOrders = async () => {
    const response = await authenticatedRequest<GetAccountOutstandingOrdersResponse>(
      getAccountOutstandingOrdersQuery,
    );
    const orders = response?.account?.outstandingOrders || [];

    return { orders };
  };

  /**
   * Get the users that have account access to your organisation.
   */
  const getAccountOrganisationUsers = async (): Promise<{ users: AccountOrganisationUser[] }> => {
    const response = await authenticatedRequest<GetAccountOrganisationUsersResponse>(
      getAccountOrganisationUsersQuery,
    );
    const accountOrganisations = response?.account?.sharedOrganisations || [];

    const user = getUser();
    const userOrganisationId = user?.organisation?.id;

    if (!userOrganisationId) {
      return { users: [] };
    }

    const organisation = accountOrganisations.find(
      sharedOrganisation => sharedOrganisation.id === userOrganisationId,
    );

    return { users: organisation?.sharedContacts || [] };
  };

  /**
   * Update the information of the organisation the user is signed in to.
   */
  const updateOrganisationOnAccount = async (
    input: UpdateOrganisationOnAccountInput['updateOrganisationOnAccountInput'],
  ) => {
    const response = await authenticatedRequest<
      UpdateOrganisationOnAccountResponse,
      UpdateOrganisationOnAccountInput
    >(updateOrganisationOnAccountMutation, {
      updateOrganisationOnAccountInput: input || {},
    });

    return response?.updateOrganisationOnAccount?.account || null;
  };

  /**
   * Reorder a previous order of the account by ID
   */
  const reorderAccountOrder = async (input: ReorderInput['reorderInput']) => {
    const response = await authenticatedRequest<ReorderResponse, ReorderInput>(reorderMutation, {
      reorderInput: input,
    });
    return response?.reorder?.cart || null;
  };

  /**
   * Get the projects for the user that is logged in.
   */
  const getAccountProjects = async () => {
    const response =
      await authenticatedRequest<GetAccountProjectsResponse>(getAccountProjectsQuery);
    const projects = response?.account?.projects || {};

    return {
      projects,
    };
  };

  return {
    getAccountBalance,
    getAccountInformation,
    getAccountOrder,
    getAccountOrders,
    getAccountOrganisationUsers,
    getAccountOutstandingOrders,
    getAccountProjects,
    inviteUserToAccountOrganisation,
    removeUserFromAccountOrganisation,
    reorderAccountOrder,
    updateOrganisationOnAccount,
    updateUserRoleInAccountOrganisation,
  };
};
