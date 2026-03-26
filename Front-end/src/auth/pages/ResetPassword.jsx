import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { useToast } from "../../shared/context/useToast";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import { 
  LockClosedIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

function ResetPassword() {
  const { success } = useToast();
  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");
  const email = query.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Lien de réinitialisation invalide.");
    }
  }, [token, email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await resetPassword({
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation
      });
      setMessage(res.message);
      success("Mot de passe réinitialisé avec succès");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-200 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-soft border border-surface-100 mb-6">
            <LockClosedIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-black text-surface-900 tracking-tighter mb-2">Nouveau mot de passe</h1>
          <p className="text-surface-500 font-medium text-sm">Sécurisez votre compte avec un nouvel accès</p>
        </div>

        <Card className="p-10 shadow-hard border-surface-50 bg-white">
          {message ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary-50 border border-primary-100 mb-2">
                <CheckCircleIcon className="h-12 w-12 text-primary-600" />
              </div>
              <p className="text-surface-600 font-bold text-sm leading-relaxed">
                {message}
              </p>
              <Link to="/login" className="inline-flex items-center text-primary-600 font-black hover:text-primary-700 transition-standard uppercase tracking-widest text-[10px]">
                Se connecter maintenant
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                  <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="label-text ml-1">Nouveau mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-standard" />
                  </div>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-text ml-1">Confirmer le mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheckIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-standard" />
                  </div>
                  <input
                    type="password"
                    required
                    value={form.password_confirmation}
                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                    placeholder="••••••••"
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-4"
                loading={loading}
              >
                Réinitialiser le mot de passe
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ResetPassword;
