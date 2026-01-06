import { useAuth } from "./useAuth";

export const usePasswordReset = () => {
  const { resetPassword, confirmPasswordReset, isLoading, error } = useAuth();

  return {
    resetPassword,
    confirmPasswordReset,
    isLoading,
    error,
  };
};
