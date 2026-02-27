import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { verifyEmailOtp, resendVerificationEmail } from "../../services/authService";
import { useToast } from "../context/useToast";
import Card from "../components/Card";
import Button from "../components/Button";
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { user, refreshUser } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email_verified_at) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const required = sessionStorage.getItem('verification_required');
    if (required) {
      info("Veuillez vérifier votre adresse email pour continuer.");
      sessionStorage.removeItem('verification_required');
    }
  }, [info]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    try {
      setLoading(true);
      await verifyEmailOtp(code);
      await refreshUser();
      success("Email vérifié avec succès !");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      error(err.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    try {
      setResending(true);
      await resendVerificationEmail();
      info("Un nouveau code a été envoyé à votre email.");
      setCooldown(60);
    } catch (err) {
      error(err.response?.data?.message || "Échec de l'envoi du code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Tech Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-[100px]"></div>
      </div>

      <Card variant="institutional" className="w-full max-w-md relative z-10 p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-orange-50 border border-orange-100 mb-6">
            <EnvelopeIcon className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight mb-2">Vérifiez votre email</h1>
          <p className="text-sm text-secondary-600 font-medium">
            Pour accéder à toutes les fonctionnalités, veuillez saisir le code envoyé à <br />
            <span className="text-primary-600 font-black">{user?.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] block text-center">Code de confirmation</label>
            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-secondary-50 border border-secondary-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:text-secondary-200"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20"
            loading={loading}
          >
            Vérifier mon compte
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest transition-colors ${
                cooldown > 0 ? 'text-secondary-300 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Renvoyer un nouveau code'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-secondary-50 text-center">
          <button
            onClick={() => navigate("/logout")}
            className="text-[10px] font-black text-secondary-400 uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </Card>
    </div>
  );
}
