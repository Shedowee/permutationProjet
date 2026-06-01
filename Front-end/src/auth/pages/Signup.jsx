import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signup, resendVerificationLink } from "../../services/authService";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import BrandLogo from "../../shared/components/BrandLogo";
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [signupMessage, setSignupMessage] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Signup, 2: Check inbox
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSignupMessage(null);
    setResendMessage(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nom complet requis";
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
      const res = await signup(form);
      setSignupMessage(
        res?.mail_sent === false
          ? "Compte créé, mais le lien de vérification n'a pas pu être envoyé. Vérifiez la configuration mail ou demandez un renvoi."
          : "Compte créé avec succès ! Un lien de vérification a été envoyé à votre adresse email. Une fois vérifié, votre compte restera limité au profil jusqu'à validation administrative."
      );
      setStep(2);
    } catch (err) {
      setSignupMessage(err.response?.data?.message || "Échec de la création du compte. Cet email est peut-être déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const res = await resendVerificationLink(form.email);
      setResendMessage(
        res?.mail_sent === false
          ? "Compte créé, mais le lien n'a pas pu être envoyé. Vérifiez votre configuration mail."
          : "Un nouveau lien de vérification a été envoyé."
      );
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Échec de l'envoi du lien.");
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    {
      icon: ShieldCheckIcon,
      title: "Compte vérifié",
      text: "Le parcours de création reste clair, sécurisé et facile à relancer si besoin.",
    },
    {
      icon: CheckBadgeIcon,
      title: "Validation progressive",
      text: "Chaque compte passe par la vérification email avant l’activation administrative.",
    },
    {
      icon: ArrowPathIcon,
      title: "Relance rapide",
      text: "Un lien de vérification peut être renvoyé sans répéter toute la procédure.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(24,168,116,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(135deg,#071a12_0%,#0d3c27_42%,#0b2519_100%)]">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-24 right-[-4rem] h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-[-6rem] top-1/3 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-1/4 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between px-8 py-10 text-white xl:px-12">
          <div className="inline-flex items-center gap-4 rounded-[1.75rem] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md shadow-[0_24px_70px_-42px_rgba(0,0,0,0.45)] w-fit">
            <BrandLogo className="h-10 w-auto max-w-[220px] brightness-0 invert" />
          </div>

          <div className="max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Créer un compte</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight text-white xl:text-6xl">
              Rejoignez le portail
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/72">
              Préparez votre accès en quelques étapes. La création reste simple, mais la validation protège les échanges.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            {highlights.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + index * 0.06 }}
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
            MaPermutation • Secure Registration
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
              {step === 1 ? (
                <>
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-600">Nouveau compte</p>
                      <h2 className="mt-3 text-3xl font-black tracking-tight text-surface-900">Créer un profil</h2>
                      <p className="mt-3 text-sm leading-6 text-surface-500">
                        Renseignez vos informations pour recevoir votre lien de vérification.
                      </p>
                    </div>
                    <div className="hidden sm:flex shrink-0 rounded-2xl bg-primary-50 px-4 py-3 text-right border border-primary-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-600">Étape</p>
                      <p className="mt-1 text-sm font-black text-primary-700">1 / 2</p>
                    </div>
                  </div>

                  {signupMessage && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`mb-8 rounded-[1.5rem] px-4 py-4 flex items-start gap-3 ${
                        signupMessage.includes("n'a pas pu")
                          ? "bg-amber-50 border border-amber-200 text-amber-700"
                          : "bg-primary-50 border border-primary-100 text-primary-700"
                      }`}
                    >
                      <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold leading-relaxed">{signupMessage}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <label className="label-text ml-1">Nom complet</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserPlusIcon className="h-5 w-5 text-surface-400 transition-standard" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Ex: Ahmed Benali"
                          className={`input-field pl-12 bg-white ${errors.name ? 'border-red-300 ring-red-100' : ''}`}
                        />
                      </div>
                      {errors.name && <p className="text-[10px] font-bold text-red-600 ml-1 uppercase tracking-wider">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="label-text ml-1">Email professionnel</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-surface-400 transition-standard" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          className={`input-field pl-12 bg-white ${errors.email ? 'border-red-300 ring-red-100' : ''}`}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] font-bold text-red-600 ml-1 uppercase tracking-wider">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="label-text ml-1">Mot de passe</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-surface-400 transition-standard" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          required
                          value={form.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`input-field pl-12 bg-white ${errors.password ? 'border-red-300 ring-red-100' : ''}`}
                        />
                      </div>
                      {errors.password && <p className="text-[10px] font-bold text-red-600 ml-1 uppercase tracking-wider">{errors.password}</p>}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-2 shadow-[0_18px_40px_-22px_rgba(0,146,69,0.55)]"
                      loading={loading}
                    >
                      Créer mon compte
                    </Button>
                  </form>
                </>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="inline-flex items-center justify-center rounded-2xl bg-primary-50 p-3 text-primary-600 border border-primary-100">
                        <CheckCircleIcon className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-600">Vérification email</p>
                      <h2 className="mt-3 text-3xl font-black tracking-tight text-surface-900">Vérifiez votre boîte mail</h2>
                      <p className="mt-3 text-sm leading-6 text-surface-500">
                        Nous avons envoyé un lien de vérification à <span className="font-black text-primary-700">{form.email}</span>.
                      </p>
                    </div>
                    <div className="hidden sm:flex shrink-0 rounded-2xl bg-primary-50 px-4 py-3 text-right border border-primary-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-600">Étape</p>
                      <p className="mt-1 text-sm font-black text-primary-700">2 / 2</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-surface-100 bg-surface-50 px-4 py-4 text-sm font-semibold text-surface-600 leading-relaxed">
                    Cliquez sur le lien dans l'email pour activer votre compte, puis revenez vous connecter. Votre accès restera limité au profil jusqu'à validation administrative.
                  </div>

                  {resendMessage && (
                    <div className={`rounded-[1.5rem] px-4 py-4 text-sm font-bold text-center ${
                      resendMessage.includes("n'a pas pu")
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-primary-50 text-primary-700 border border-primary-100"
                    }`}>
                      {resendMessage}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      loading={loading}
                      onClick={handleResend}
                    >
                      Renvoyer le lien
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate("/login", { replace: true })}
                    >
                      Aller à la connexion
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-surface-100 text-center">
                <p className="text-sm font-bold text-surface-600">
                  Déjà inscrit ?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 transition-standard">
                    Se connecter
                  </Link>
                </p>
              </div>
            </Card>
            
            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
              &copy; {new Date().getFullYear()} MaPermutation • Production Ready
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Signup;
