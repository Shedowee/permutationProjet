import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import { useToast } from "../../shared/context/useToast";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import { 
  KeyIcon, 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

function ForgotPassword() {
  const { success } = useToast();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await forgotPassword(email);
      setMessage(res.message);
      success("Lien de réinitialisation envoyé par email");
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
            <KeyIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-black text-surface-900 tracking-tighter mb-2">Mot de passe oublié</h1>
          <p className="text-surface-500 font-medium text-sm">Réinitialisez votre accès en quelques instants</p>
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
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Retour à la connexion
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
                <label className="label-text ml-1">Email Professionnel</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-standard" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
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
                Envoyer le lien
              </Button>

              <div className="text-center mt-6">
                <Link to="/login" className="text-[10px] font-black text-surface-400 hover:text-primary-600 uppercase tracking-widest transition-standard">
                  Annuler
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
