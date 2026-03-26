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
        success("Déconnexion réussie");
        navigate("/login", { replace: true });
      } catch (e) {
        error("La déconnexion a échoué, veuillez réessayer");
      }
    })();
  }, [logout, navigate, success, error]);

  return null;
};

export default Logout;
