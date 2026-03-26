import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../context/useToast";
import { updateProfile, updatePassword, updateEmail, verifyNewEmail } from "../../services/userService";
import Layout from "../layouts/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { 
  UserCircleIcon, 
  LockClosedIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  KeyIcon
} from "@heroicons/react/24/outline";

export default function Profile() {
  const { user, role, refreshUser } = useAuth();
  const { success, error: toastError, info } = useToast();
  
  const [profileForm, setProfileForm] = useState({
    nom: user?.nom || "",
    age: user?.age || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  const [emailForm, setEmailForm] = useState({
    email: user?.email || "",
    code: ""
  });

  const [emailStep, setEmailStep] = useState(1); // 1: Change request, 2: Verification
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        nom: user.nom || "",
        age: user.age || "",
        phone: user.phone || "",
        address: user.address || ""
      });
      setEmailForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(profileForm);
      await refreshUser();
      success("Profil mis à jour avec succès");
    } catch (err) {
      toastError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updatePassword(passwordForm);
      setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      success("Mot de passe mis à jour avec succès");
    } catch (err) {
      toastError(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (emailStep === 1) {
        await updateEmail(emailForm.email);
        setEmailStep(2);
        info("Un code a été envoyé à votre nouvelle adresse email");
      } else {
        await verifyNewEmail({ email: emailForm.email, code: emailForm.code });
        await refreshUser();
        setEmailStep(1);
        setEmailForm(prev => ({ ...prev, code: "" }));
        success("Adresse email mise à jour et vérifiée");
      }
    } catch (err) {
      toastError(err.response?.data?.message || "Erreur lors du changement d'email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase flex items-center gap-4">
              <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-primary">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              Mon Profil
            </h1>
            <p className="text-surface-500 mt-2 font-bold uppercase tracking-widest text-[10px] ml-20">
              Gérez vos informations personnelles et votre sécurité
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-surface-100 shadow-soft self-end md:self-auto">
            <ShieldCheckIcon className="h-5 w-5 text-primary-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-surface-900">{role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Quick Info */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-standard"></div>
              
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary-500 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-black shadow-primary">
                  {user?.nom?.[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-soft flex items-center justify-center border border-surface-100">
                  <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                </div>
              </div>
              
              <h2 className="text-xl font-black text-surface-900 tracking-tight">{user?.nom}</h2>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">{user?.email}</p>
              
              <div className="mt-10 pt-8 border-t border-surface-50 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-surface-400">Membre depuis</span>
                  <span className="text-surface-900">{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-surface-400">Statut</span>
                  <span className="text-primary-600">Actif</span>
                </div>
              </div>
            </Card>

            <Card variant="dark" className="p-8 space-y-6">
              <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <KeyIcon className="h-4 w-4" />
                Sécurité du compte
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Assurez-vous d'utiliser un mot de passe fort et de ne jamais partager vos identifiants.
              </p>
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Double auth. (Bientôt)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sessions actives</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations Personnelles */}
            <Card className="p-10">
              <h2 className="text-xs font-black text-surface-900 mb-10 flex items-center uppercase tracking-[0.2em] border-b border-surface-50 pb-6">
                <UserCircleIcon className="h-5 w-5 mr-3 text-primary-500" />
                Informations Personnelles
              </h2>
              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="label-text ml-1">Nom Complet</label>
                  <input
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                    className="input-field"
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-text ml-1">Âge</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="input-field"
                    placeholder="Votre âge"
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-text ml-1">Téléphone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-field"
                    placeholder="06..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-text ml-1">Adresse</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="input-field"
                    placeholder="Votre adresse"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" variant="primary" loading={loading} className="w-full md:w-auto px-12">
                    Mettre à jour le profil
                  </Button>
                </div>
              </form>
            </Card>

            {/* Email */}
            <Card className="p-10">
              <h2 className="text-xs font-black text-surface-900 mb-10 flex items-center uppercase tracking-[0.2em] border-b border-surface-50 pb-6">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-secondary-500" />
                Adresse Email
              </h2>
              <form onSubmit={handleEmailSubmit} className="space-y-8">
                {emailStep === 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-3">
                      <label className="label-text ml-1">Nouvel Email</label>
                      <input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        className="input-field"
                        placeholder="nouveau@email.com"
                      />
                    </div>
                    <Button type="submit" variant="secondary" loading={loading} className="px-12">
                      Changer l'email
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-3">
                      <label className="label-text ml-1 text-primary-600">Code de vérification</label>
                      <input
                        type="text"
                        value={emailForm.code}
                        onChange={(e) => setEmailForm({ ...emailForm, code: e.target.value })}
                        className="input-field border-primary-200 bg-primary-50/30 text-center text-xl font-black tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" variant="primary" loading={loading} className="flex-1">
                        Vérifier
                      </Button>
                      <Button variant="ghost" onClick={() => setEmailStep(1)} className="px-6">
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Card>

            {/* Password */}
            <Card className="p-10">
              <h2 className="text-xs font-black text-surface-900 mb-10 flex items-center uppercase tracking-[0.2em] border-b border-surface-50 pb-6">
                <LockClosedIcon className="h-5 w-5 mr-3 text-amber-500" />
                Sécurité & Mot de passe
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="label-text ml-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="label-text ml-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="label-text ml-1">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" variant="outline" loading={loading} className="w-full md:w-auto px-12 border-surface-200">
                    Changer le mot de passe
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
