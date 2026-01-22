import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, confirmAccount } from "../../services/authService";

function Signup() {
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [signupMessage, setSignupMessage] = useState(null);
  const [code, setCode] = useState("");
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSignupMessage(null);
    setConfirmMessage(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!form.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email invalide";
    if (!form.password) newErrors.password = "Le mot de passe est requis";
    else if (form.password.length < 6) newErrors.password = "Minimum 6 caractères";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await signup(form);
      setSignupMessage("Compte créé. Un code a été envoyé à votre email.");
    } catch (err) {
      setSignupMessage(err.response?.data?.message || "Échec de création du compte");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setConfirmMessage("Veuillez saisir le code de confirmation");
      return;
    }
    try {
      setLoading(true);
      const res = await confirmAccount({ email: form.email, code });
      setConfirmMessage(res.message || "Compte confirmé");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setConfirmMessage(err.response?.data?.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="bg-white/90 backdrop-blur p-10 rounded-xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800">Créer un compte</h2>
          <p className="text-sm text-slate-600 mt-1">Inscription OFPPT</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nom ? "border-red-500" : "border-slate-300"}`}
            />
            <p className="text-red-500 text-sm mt-1 min-h-[1.25rem]">{errors.nom || "\u00A0"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-slate-300"}`}
            />
            <p className="text-red-500 text-sm mt-1 min-h-[1.25rem]">{errors.email || "\u00A0"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? "border-red-500" : "border-slate-300"}`}
            />
            <p className="text-red-500 text-sm mt-1 min-h-[1.25rem]">{errors.password || "\u00A0"}</p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        {signupMessage && (
          <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            {signupMessage}
          </div>
        )}

        <form onSubmit={handleConfirm} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Code de confirmation</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-slate-300"
            placeholder="Entrez le code reçu"
          />
          <button
            type="submit"
            className="w-full flex justify-center items-center bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Confirmation..." : "Confirmer le compte"}
          </button>
          {confirmMessage && (
            <p className="text-sm text-green-600 mt-2">{confirmMessage}</p>
          )}
        </form>

        <p className="text-xs text-center text-slate-500 mt-6">
          Déjà un compte ? <a href="/login" className="text-blue-600 hover:text-blue-700">Se connecter</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
