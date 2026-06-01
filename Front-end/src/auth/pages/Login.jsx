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

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import BrandLogo from "../../shared/components/BrandLogo";
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const matriculeRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9._-]{3,20}$/;

  // Rate-limit UX state
  const ATTEMPT_LIMIT = 3;
  const COOLDOWN_SECONDS = 30;
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null); // timestamp (ms)
  const [remaining, setRemaining] = useState(0); // seconds
  const timerRef = useRef(null);

  const navigate = useNavigate();
  const { login, loading, isAuthenticated, role, error: globalError, clearError } = useAuth();
  const isLocked = Boolean(lockUntil && remaining > 0);

  const redirectToDashboard = useCallback((userRole) => {
    const dashboards = {
      admin: "/admin",
      commission: "/commission",
      formateur: "/formateur",
      user: "/profile",
    };
    const path = dashboards[userRole] || "/profile";
    navigate(path, { replace: true });
  }, [navigate]);

  const resolveLoginError = (err) => {
    const status = err?.status || err?.response?.status;
    const data = err?.data || err?.response?.data || {};
    const code = err?.code || data.error_code || '';
    const field = err?.field || data.field || '';
    const message = data.message || err?.message || "Une erreur est survenue";

    if (status === 401) {
      if (code === 'IDENTIFIER_NOT_FOUND' || field === 'email') {
        return { message: 'Identifiant inconnu.', field: 'username', fieldMessage: 'Identifiant inconnu' };
      }
      if (code === 'INVALID_PASSWORD' || field === 'password') {
        return { message: 'Mot de passe incorrect.', field: 'password', fieldMessage: 'Mot de passe incorrect' };
      }
      return { message: 'Identifiant ou mot de passe incorrect.', field: 'username', fieldMessage: 'Vérifiez vos identifiants' };
    }

    if (status === 403) {
      return { message: message || 'Accès refusé. Compte suspendu ou non autorisé.' };
    }

    if (status === 422) {
      return { message: message || 'Données invalides.' };
    }

    if (!err?.response) {
      return { message: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
    }

    return { message };
  };

  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard(role);
    }
    // Clear global error when leaving the page
    return () => clearError && clearError();
  }, [isAuthenticated, role, redirectToDashboard, clearError]);

  useEffect(() => {
    if (globalError) {
      setLocalError(globalError);
    }
  }, [globalError]);

  // Initialize attempts/lock from storage
  useEffect(() => {
    const savedAttempts = Number(sessionStorage.getItem('login_attempts') || '0');
    const savedLockUntil = Number(sessionStorage.getItem('login_lock_until') || '0');
    const now = Date.now();
    if (savedLockUntil && savedLockUntil > now) {
      setLockUntil(savedLockUntil);
      setAttempts(savedAttempts);
      setRemaining(Math.ceil((savedLockUntil - now) / 1000));
    } else {
      // clean stale
      sessionStorage.removeItem('login_lock_until');
      sessionStorage.setItem('login_attempts', String(savedAttempts || 0));
      setAttempts(savedAttempts || 0);
    }
  }, []);

  // Countdown handler when locked
  useEffect(() => {
    if (!lockUntil) return;
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, lockUntil - now);
      setRemaining(Math.ceil(diff / 1000));
      if (diff <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setLockUntil(null);
        setAttempts(0);
        sessionStorage.removeItem('login_lock_until');
        sessionStorage.setItem('login_attempts', '0');
        setLocalError("");
      }
    };
    timerRef.current = setInterval(tick, 500);
    tick();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockUntil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (localError) setLocalError("");
    if (globalError) clearError();
  };

  const validate = () => {
    const newErrors = {};
    const username = form.username.trim();
    const password = form.password;

    if (!username) {
      newErrors.username = "Email ou matricule requis";
    } else if (!emailRegex.test(username) && !matriculeRegex.test(username)) {
      newErrors.username = "Entrez un email valide ou un matricule";
    }
    if (!password) {
      newErrors.password = "Mot de passe requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const highlights = [
    {
      icon: ShieldCheckIcon,
      title: "Accès sécurisé",
      text: "Connexion protégée avec contrôle de session et redirection par rôle.",
    },
    {
      icon: ClockIcon,
      title: "Réponses rapides",
      text: "Interface légère conçue pour retrouver votre espace en quelques secondes.",
    },
    {
      icon: PresentationChartLineIcon,
      title: "Vue claire",
      text: "Les accès administratifs, commission et formateur sont organisés proprement.",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockUntil && lockUntil > Date.now()) {
      setLocalError(`Trop de tentatives. Réessayez dans ${remaining}s.`);
      return;
    }
    if (!validate()) return;

    const username = form.username.trim();

    try {
      await login({
        email: username, // This can be email or employee_number
        password: form.password,
      });
    } catch (err) {
      const parsed = resolveLoginError(err);
      console.error('Login failed', err);
      if (parsed.field === 'username') {
        // increment attempts and maybe lock
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        sessionStorage.setItem('login_attempts', String(nextAttempts));
        if (nextAttempts >= ATTEMPT_LIMIT) {
          const until = Date.now() + COOLDOWN_SECONDS * 1000;
          setLockUntil(until);
          sessionStorage.setItem('login_lock_until', String(until));
        }
        setErrors((prev) => ({ ...prev, username: parsed.fieldMessage || parsed.message }));
      } else if (parsed.field === 'password') {
        setErrors((prev) => ({ ...prev, password: parsed.fieldMessage || 'Mot de passe incorrect' }));
      }
      setLocalError(parsed.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(24,168,116,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(135deg,#071a12_0%,#0d3c27_42%,#0b2519_100%)]">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/4 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/4 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between px-8 py-10 text-white xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 rounded-[1.75rem] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md shadow-[0_24px_70px_-42px_rgba(0,0,0,0.45)] w-fit"
          >
            <BrandLogo className="h-10 w-auto max-w-[220px] brightness-0 invert" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="max-w-xl"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Portail de permutation</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight text-white xl:text-6xl">
              Connectez-vous à votre espace
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/72">
              Accédez à votre profil, suivez vos demandes et retrouvez rapidement les actions liées à votre rôle.
            </p>
          </motion.div>

          <div className="space-y-4 max-w-xl">
            {highlights.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.14 + index * 0.06 }}
                className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-sm"
              >
                <div className="rounded-2xl bg-white/12 p-3 text-white ring-1 ring-inset ring-white/10">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">
            MaPermutation • Secure Access
          </p>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="lg:hidden mb-6 flex items-center justify-center">
              <div className="inline-flex items-center justify-center rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
                <BrandLogo className="h-10 w-auto max-w-[220px] brightness-0 invert" />
              </div>
            </div>

            <Card hover={false} className="bg-white/92 backdrop-blur-xl border-white/70 shadow-[0_32px_90px_-48px_rgba(0,0,0,0.55)] p-6 sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-600">Connexion sécurisée</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-surface-900">Bienvenue</h2>
                  <p className="mt-3 text-sm leading-6 text-surface-500">
                    Connectez-vous avec votre email ou matricule pour accéder à votre espace.
                  </p>
                </div>
              </div>

              {(globalError || localError) && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 flex items-start gap-3"
                >
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-700 leading-relaxed uppercase tracking-wide">{localError || globalError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="label-text" htmlFor="username">Identifiant</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      className={`input-field pl-12 bg-white ${errors.username ? 'border-red-300 ring-red-100' : ''}`}
                      placeholder="Email ou matricule"
                      value={form.username}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest ml-1">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <label className="label-text" htmlFor="password">Mot de passe</label>
                    <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-standard">
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
                      className={`input-field pl-12 pr-12 bg-white ${errors.password ? 'border-red-300 ring-red-100' : ''}`}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest ml-1">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 shadow-[0_18px_40px_-22px_rgba(0,146,69,0.55)]"
                  loading={loading}
                  disabled={loading || isLocked}
                >
                  Se connecter
                </Button>

                {isLocked && (
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                      Trop de tentatives. Réessayez dans {remaining}s.
                    </p>
                  </div>
                )}
              </form>

              <div className="mt-8 pt-6 border-t border-surface-100 text-center">
                <p className="text-sm font-bold text-surface-600">
                  Pas encore de compte ?{' '}
                  <Link to="/signup" className="text-primary-600 hover:text-primary-700 transition-standard">
                    Créer un profil
                  </Link>
                </p>
              </div>
            </Card>

            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
              &copy; {new Date().getFullYear()} MaPermutation
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
