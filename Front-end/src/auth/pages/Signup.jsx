import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, confirmAccount, resendCode } from "../../services/authService";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

function Signup() {
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [signupMessage, setSignupMessage] = useState(null);
  const [code, setCode] = useState("");
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Signup, 2: Confirm
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
    if (!form.nom.trim()) newErrors.nom = "Nom complet requis";
    if (!form.email.trim()) newErrors.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Format d'email invalide";
    if (!form.password) newErrors.password = "Mot de passe requis";
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
      setSignupMessage("Compte créé avec succès ! Un code de confirmation a été envoyé à votre adresse email.");
      setStep(2);
    } catch (err) {
      setSignupMessage(err.response?.data?.message || "Échec de la création du compte. Cet email est peut-être déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setConfirmMessage("Veuillez saisir le code reçu par email.");
      return;
    }
    try {
      setLoading(true);
      const res = await confirmAccount({ email: form.email, code });
      setConfirmMessage(res.message || "Votre compte a été confirmé avec succès !");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setConfirmMessage(err.response?.data?.message || "Code de confirmation invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendCode(form.email);
      setConfirmMessage("Un nouveau code a été envoyé.");
    } catch (err) {
      setConfirmMessage(err.response?.data?.message || "Échec de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-surface-200 mb-6">
            <UserPlusIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-black text-surface-900 tracking-tighter mb-2">Rejoignez-nous</h1>
          <p className="text-surface-500 font-medium">Créez votre compte formateur OFPPT</p>
        </div>

        <Card className="p-10 shadow-2xl border-surface-200/60 bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
          {step === 1 ? (
            <form onSubmit={handleSignup} className="space-y-6">
              {signupMessage && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-fadeIn">
                  <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-bold">{signupMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Nom Complet</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserPlusIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="nom"
                    required
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Ex: Ahmed Benali"
                    className={`block w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.nom ? 'border-red-300' : 'border-surface-200'} rounded-2xl text-surface-900 placeholder:text-surface-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium`}
                  />
                </div>
                {errors.nom && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.nom}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Email Professionnel</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className={`block w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.email ? 'border-red-300' : 'border-surface-200'} rounded-2xl text-surface-900 placeholder:text-surface-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium`}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`block w-full pl-12 pr-4 py-4 bg-surface-50 border ${errors.password ? 'border-red-300' : 'border-surface-200'} rounded-2xl text-surface-900 placeholder:text-surface-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium`}
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 mt-4"
                loading={loading}
              >
                Créer mon compte
              </Button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-50 border border-green-100 mb-6">
                  <CheckCircleIcon className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-surface-900 mb-2 tracking-tight">Vérification de l'email</h2>
                <p className="text-sm text-surface-500 font-medium leading-relaxed">
                  Nous avons envoyé un code de confirmation à <br />
                  <span className="text-primary-600 font-black">{form.email}</span>.
                </p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] block text-center">Code de confirmation</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className="h-6 w-6 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000000"
                      className="w-full pl-14 pr-4 py-5 bg-surface-50 border border-surface-200 rounded-2xl text-surface-900 text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="success"
                  className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-green-500/20"
                  loading={loading}
                >
                  Confirmer le compte
                </Button>

                {confirmMessage && (
                  <div className={`p-4 rounded-2xl text-center text-sm font-bold animate-fadeIn ${confirmMessage.includes("succès") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                    {confirmMessage}
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors mb-2"
                >
                  Renvoyer le code
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-[10px] font-black text-surface-400 hover:text-primary-600 uppercase tracking-widest transition-colors"
                >
                  Retour à l'inscription
                </button>
              </form>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-surface-100 text-center">
            <p className="text-sm text-surface-500 font-medium">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 font-black hover:text-primary-700 transition-colors">
                Se connecter
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

export default Signup;
