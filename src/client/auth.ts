import {
  type ChangePasswordInput,
  changePasswordMutation,
  type ChangePasswordResponse,
  type RequestPasswordResetInput,
  requestPasswordResetMutation,
  type RequestPasswordResetResponse,
  type RequestUserVerificationInput,
  requestUserVerificationMutation,
  type RequestUserVerificationResponse,
  type ResetPasswordInput,
  resetPasswordMutation,
  type ResetPasswordResponse,
  type SignInAsOrganisationInput,
  signInAsOrganisationMutation,
  type SignInAsOrganisationResponse,
  type SignInInput,
  signInMutation,
  type SignInResponse,
  signOutOfOrganisationMutation,
  type SignOutOfOrganisationResponse,
  type SignUpInput,
  signUpMutation,
  type SignUpResponse,
  type UpdateAccountInformationInput,
  updateAccountInformationMutation,
  type UpdateAccountInformationResponse,
  type VerifyUserInput,
  verifyUserMutation,
  type VerifyUserResponse,
} from '../mutations';
import type { ClientContext } from './context';

export const createAuthClient = ({
  request,
  authenticatedRequest,
  userToken: { getUser, removeUserToken, storeUserToken, validateUserToken },
}: ClientContext) => {
  /**
   * Change your password.
   */
  const changePassword = async (input: ChangePasswordInput['changePasswordInput']) => {
    const { newPassword, password } = input || {};
    const response = await authenticatedRequest<ChangePasswordResponse, ChangePasswordInput>(
      changePasswordMutation,
      {
        changePasswordInput: {
          password,
          newPassword,
        },
      },
    );

    return !!response?.setPasswordForAccount?.account?.email;
  };

  /**
   * Request a password reset.
   */
  const requestPasswordReset = async (
    input: RequestPasswordResetInput['requestPasswordResetInput'],
  ) => {
    const { email } = input || {};
    const response = await request<RequestPasswordResetResponse, RequestPasswordResetInput>(
      requestPasswordResetMutation,
      {
        requestPasswordResetInput: {
          email,
        },
      },
    );

    return response?.requestCustomerPasswordReset?.isSuccessful || false;
  };

  /**
   * Request a user verification.
   */
  const requestUserVerification = async (
    input: RequestUserVerificationInput['requestUserVerificationInput'],
  ) => {
    const { email } = input || {};
    const response = await request<RequestUserVerificationResponse, RequestUserVerificationInput>(
      requestUserVerificationMutation,
      {
        requestUserVerificationInput: {
          email,
        },
      },
    );

    return response?.requestCustomerVerificationLink?.isSuccessful || false;
  };

  /**
   * Reset your password.
   */
  const resetPassword = async (input: ResetPasswordInput['resetPasswordInput']) => {
    const { token, password } = input || {};
    const response = await request<ResetPasswordResponse, ResetPasswordInput>(
      resetPasswordMutation,
      {
        resetPasswordInput: {
          token,
          password,
        },
      },
    );

    return response?.resetCustomerPassword?.isSuccessful || false;
  };

  /**
   * Sign in
   */
  const signIn = async (input: SignInInput['signInInput']) => {
    const { email, password } = input || {};
    const response = await request<SignInResponse, SignInInput>(signInMutation, {
      signInInput: {
        email,
        password,
      },
    });
    const { token } = response?.logInCustomer || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Sign in as organisation
   * Requires a default signIn first
   */
  const signInAsOrganisation = async (
    input: SignInAsOrganisationInput['signInAsOrganisationInput'],
  ) => {
    const { organisationId } = input || {};
    const response = await authenticatedRequest<
      SignInAsOrganisationResponse,
      SignInAsOrganisationInput
    >(signInAsOrganisationMutation, {
      signInAsOrganisationInput: {
        organisationId,
      },
    });
    const { token } = response?.logInAsOrganisation || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Sign out of an organisation to go back to the users account
   */
  const signOutOfOrganisation = async () => {
    const response = await authenticatedRequest<SignOutOfOrganisationResponse>(
      signOutOfOrganisationMutation,
    );
    const { token } = response?.logOutAsOrganisation || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Sign out
   */
  const signOut = () => {
    removeUserToken();
  };

  /**
   * Sign up
   */
  const signUp = async (input: SignUpInput['signUpInput']) => {
    const { givenName, additionalName, familyName, email, password, addressing, phoneNumber } =
      input || {};
    const response = await request<SignUpResponse, SignUpInput>(signUpMutation, {
      signUpInput: {
        givenName,
        additionalName,
        familyName,
        email,
        password,
        addressing,
        phoneNumber,
      },
    });
    const { token } = response?.registerCustomer || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  /**
   * Update the account information of the user that is logged in.
   */
  const updateAccountInformation = async (
    input: UpdateAccountInformationInput['updateAccountInformationInput'],
  ) => {
    const response = await authenticatedRequest<
      UpdateAccountInformationResponse,
      UpdateAccountInformationInput
    >(updateAccountInformationMutation, {
      updateAccountInformationInput: input || {},
    });

    return response?.updateAccount?.account || null;
  };

  /**
   * Verify the user.
   */
  const verifyUser = async (input: VerifyUserInput['verifyUserInput']) => {
    const { token: verificationToken } = input || {};
    const response = await request<VerifyUserResponse, VerifyUserInput>(verifyUserMutation, {
      verifyUserInput: {
        token: verificationToken,
      },
    });
    const { token } = response?.verifyCustomer || {};

    if (!token || !validateUserToken(token)) {
      return Promise.reject('Invalid user token');
    }

    storeUserToken(token);

    return getUser();
  };

  return {
    changePassword,
    requestPasswordReset,
    requestUserVerification,
    resetPassword,
    signIn,
    signInAsOrganisation,
    signOut,
    signOutOfOrganisation,
    signUp,
    updateAccountInformation,
    verifyUser,
  };
};
