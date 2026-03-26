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
import { motion } from "framer-motion";
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
      setLoginError("Identifiants incorrects");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-4 rounded-3xl bg-white shadow-soft border border-surface-100 mb-6"
          >
            <ShieldCheckIcon className="h-10 w-10 text-primary-500" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-black text-surface-900 tracking-tight uppercase"
          >
            Bienvenue
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-surface-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2"
          >
            Portail de Permutations OFPPT
          </motion.p>
        </div>

        <Card hover={false} className="shadow-hard border-surface-50">
          {loginError && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-700 leading-relaxed">{loginError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="label-text" htmlFor="username">Identifiant</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className={`input-field pl-12 ${errors.username ? 'border-red-300 ring-red-50' : ''}`}
                  placeholder="Email ou matricule"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label-text" htmlFor="password">Mot de passe</label>
                <Link to="/forgot-password" size="xs" className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-300 ring-red-50' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-surface-100 text-center">
            <p className="text-sm font-bold text-surface-500">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 transition-standard">
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
