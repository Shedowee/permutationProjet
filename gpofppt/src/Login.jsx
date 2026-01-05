import { useState } from "react";

export function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on input
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Username validation
    if (!form.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (form.username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit avoir au moins 3 caractères";
    } else if (!/^[a-zA-Z0-9._]+$/.test(form.username)) {
      newErrors.username =
        "Le nom d'utilisateur contient des caractères invalides";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (form.password.length < 6) {
      newErrors.password = "Le mot de passe doit avoir au moins 6 caractères";
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(form.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins un chiffre et un caractère spécial";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Login success:", form);
      setLoading(false);
    }, 1500);
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
          />
          {/* Reserve space for error */}
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
          />
          {/* Show/Hide toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-sm text-blue-600 hover:text-blue-700"
          >
            {showPassword ? "Cacher" : "Voir"}
          </button>
          {/* Reserve space for error */}
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
