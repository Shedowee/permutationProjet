/**
 * src/auth/pages/Login.jsx
 *
 * Login form with Sanctum authentication
 *
 * Flow:
 * 1. User submits credentials
 * 2. Get CSRF cookie from /sanctum/csrf-cookie
 * 3. POST credentials to /api/login (backend sets HttpOnly cookie)
 * 4. Auth context refetches /api/me
 * 5. Redirect based on user role
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, role } = useAuth();

  const redirectToDashboard = useCallback((userRole) => {
    const from = location.state?.from?.pathname || "/";
    const dashboards = {
      admin: "/admin",
      commission: "/commission",
      formateur: "/formateur",
      employe: "/employe",
    };
    const path = dashboards[userRole] || from;
    navigate(path, { replace: true });
  }, [location.state?.from?.pathname, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard(role);
    }
  }, [isAuthenticated, role, redirectToDashboard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setLoginError(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = "Email ou nom d'utilisateur requis";
    }
    if (!form.password) {
      newErrors.password = "Mot de passe requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoginError(null);
      await login({
        email: form.username,
        password: form.password,
      });
    } catch (err) {
      setLoginError(err.message || "Échec de l'authentification. Veuillez vérifier vos identifiants.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-4 py-12 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-surface-200 mb-6">
            <ShieldCheckIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Bienvenue</h1>
          <p className="text-surface-300 font-medium">Connectez-vous à votre espace Permutations</p>
          <div className="mx-auto h-1 w-24 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mt-4"></div>
        </div>

        <Card className="p-10 shadow-2xl border-surface-200/60 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
          {loginError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-fadeIn">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Identifiant</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.username ? 'border-red-300' : 'border-surface-200'} rounded-2xl text-surface-900 placeholder:text-surface-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium`}
                  placeholder="Email ou matricule"
                />
              </div>
              {errors.username && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Mot de passe</label>
                <Link to="/forgot-password" className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-12 py-4 bg-surface-50 border ${errors.password ? 'border-red-300' : 'border-surface-200'} rounded-2xl text-surface-900 placeholder:text-surface-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-300 hover:text-surface-500 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 mt-4"
              loading={loading}
            >
              Connexion
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-surface-100 text-center">
            <p className="text-sm text-surface-500 font-medium">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-600 font-black hover:text-primary-700 transition-colors">
                Créer un profil
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-[10px] font-bold text-surface-400 uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} OFPPT Permutations • Production Ready
        </p>
      </div>
    </div>
  );
}

export default Login;
