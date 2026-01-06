import { useAuth } from "./useAuth";

export const useUserProfile = () => {
  const { profile, isLoading, updateProfile } = useAuth();

  return {
    profile,
    isLoading,
    updateProfile,
  };
};
