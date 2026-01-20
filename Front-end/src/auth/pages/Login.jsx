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
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, role } = useAuth();

  /**
   * Redirect to appropriate dashboard based on role
   */
  const redirectToDashboard = useCallback((userRole) => {
    const from = location.state?.from?.pathname || "/";

    const dashboards = {
      admin: "/admin",
      commission: "/commission",
      formateur: "/formateur",
    };

    const path = dashboards[userRole] || from;
    navigate(path, { replace: true });
  }, [location.state?.from?.pathname, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard(role);
    }
  }, [isAuthenticated, role, redirectToDashboard]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setLoginError(null);
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (form.username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit avoir au moins 3 caractères";
    }

    if (!form.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (form.password.length < 6) {
      newErrors.password = "Le mot de passe doit avoir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   *
   * Flow:
   * 1. Get CSRF cookie
   * 2. POST credentials to /api/login
   * 3. Auth context calls /api/me to get user data
   * 4. Redirect based on role (via useEffect above)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoginError(null);

      // Call login from auth context
      // This handles: CSRF cookie -> login -> fetch /api/me
      await login({
        email: form.username, // Using username as email
        password: form.password,
      });

      // Redirect will happen via useEffect when auth state updates
    } catch (err) {
      setLoginError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur p-10 rounded-xl shadow-xl w-full max-w-md border border-slate-200"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800">Connexion</h2>
          <p className="text-sm text-slate-600 mt-1">
            Application de gestion des permutations
          </p>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{loginError}</p>
          </div>
        )}

        {/* Username */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Ex : h.benali"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.username ? "border-red-500" : "border-slate-300"}`}
            disabled={loading}
          />
          <p className="text-red-500 text-sm mt-1 min-h-[1.25rem]">
            {errors.username || "\u00A0"}
          </p>
        </div>

        {/* Password */}
        <div className="mb-7 relative">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mot de passe
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.password ? "border-red-500" : "border-slate-300"}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-sm text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            {showPassword ? "Cacher" : "Voir"}
          </button>
          <p className="text-red-500 text-sm mt-1 min-h-[1.25rem]">
            {errors.password || "\u00A0"}
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full flex justify-center items-center bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-slate-500 mt-6">
          © OFPPT – Accès sécurisé
        </p>
      </form>
    </div>
  );
}

export default Login;
