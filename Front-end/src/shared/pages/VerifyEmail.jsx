import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { resendVerificationLink, resendVerificationEmail } from "../../services/authService";
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
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mailWarning, setMailWarning] = useState("");
  const { user, refreshUser } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = user?.email || searchParams.get("email") || "";

  useEffect(() => {
    if (user?.email_verified_at) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "1") {
      success("Votre adresse email a été vérifiée.");
      if (user) {
        void refreshUser().finally(() => navigate("/dashboard", { replace: true }));
      } else {
        navigate("/login?verified=1", { replace: true });
      }
    }
  }, [location.search, navigate, refreshUser, success, user]);

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

  const handleResend = async () => {
    if (cooldown > 0) return;
    if (!email) {
      error("Aucune adresse email disponible pour renvoyer le lien.");
      return;
    }
    
    try {
      setLoading(true);
      setResending(true);
      if (user) {
        const res = await resendVerificationEmail();
        setMailWarning(res?.mail_sent === false ? "Le lien n'a pas pu être envoyé. Vérifiez la configuration mail." : "");
      } else {
        const res = await resendVerificationLink(email);
        setMailWarning(res?.mail_sent === false ? "Le lien n'a pas pu être envoyé. Vérifiez la configuration mail." : "");
      }
      info("Un nouveau lien de vérification a été envoyé à votre email.");
      setCooldown(60);
    } catch (err) {
      error(err.response?.data?.message || "Échec de l'envoi du lien");
    } finally {
      setResending(false);
      setLoading(false);
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
          <div className="inline-flex items-center justify-center p-4 rounded-lg bg-orange-50 border border-orange-100 mb-6">
            <EnvelopeIcon className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight mb-2">Vérifiez votre email</h1>
          <p className="text-sm text-secondary-600 font-medium">
            Pour accéder au profil, cliquez sur le lien envoyé à <br />
            <span className="text-primary-600 font-black">{email || "votre adresse email"}</span>
          </p>
        </div>

        <div className="space-y-6">
          {mailWarning && (
            <div className="p-4 rounded-lg text-sm font-bold text-center bg-amber-50 text-amber-700 border border-amber-100">
              {mailWarning}
            </div>
          )}

          <div className="p-4 rounded-lg bg-primary-50 border border-primary-100 text-center">
            <p className="text-sm font-bold text-primary-700">
              Ouvrez le message reçu puis cliquez sur le bouton de vérification. Ensuite, votre compte restera en accès limité jusqu'à validation administrative.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            className="w-full py-4 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20"
            loading={loading}
            disabled={!email}
            onClick={handleResend}
          >
            Renvoyer le lien
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
              {cooldown > 0 ? `Renvoyer le lien (${cooldown}s)` : 'Renvoyer un nouveau lien'}
            </button>
          </div>
        </div>

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
