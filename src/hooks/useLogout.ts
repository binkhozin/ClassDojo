import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const { logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return {
    logout: handleLogout,
    isLoading,
  };
};
