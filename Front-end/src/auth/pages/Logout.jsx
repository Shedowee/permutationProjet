import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../shared/context/useToast";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    (async () => {
      try {
        await logout();
        success("Logout successful");
        navigate("/login", { replace: true });
      } finally {
      }
    })().catch(() => {
      error("Logout failed, please try again");
      {
      }
    });
  }, [logout, navigate, success, error]);

  return null;
};

export default Logout;
