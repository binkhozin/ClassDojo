import { useAuth } from "./useAuth";
import { SignUpData } from "../types";

export const useSignUp = () => {
  const { signUp, isLoading, error } = useAuth();

  const handleSignUp = async (data: SignUpData) => {
    return await signUp(data);
  };

  return {
    signUp: handleSignUp,
    isLoading,
    error,
  };
};
