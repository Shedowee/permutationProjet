import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { updateProfile, updatePassword, updateEmail, verifyNewEmail } from "../../services/userService";
import { useToast } from "../context/useToast";
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
  const { success, error, info } = useToast();
  
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
      error(err.response?.data?.message || "Erreur lors de la mise à jour");
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
      error(err.response?.data?.message || "Erreur lors du changement de mot de passe");
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
      error(err.response?.data?.message || "Erreur lors du changement d'email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-secondary-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-secondary-400" />
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-surface-800 tracking-tight">{user?.nom}</h1>
            <div className="flex items-center mt-2 space-x-3">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-100">
                {role}
              </span>
              <span className={`px-3 py-1 ${user?.email_verified ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'} text-[10px] font-black uppercase tracking-widest rounded-lg border`}>
                {user?.email_verified ? 'Vérifié' : 'Non Vérifié'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profil */}
            <Card variant="institutional" className="p-8">
              <h2 className="text-lg font-black text-surface-800 uppercase tracking-widest mb-8 flex items-center border-b border-secondary-50 pb-4">
                <UserCircleIcon className="w-6 h-6 mr-3 text-primary-500" />
                Informations Personnelles
              </h2>
              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Nom Complet</label>
                  <input
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Âge</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Adresse</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm min-h-[100px]"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" variant="primary" loading={loading} className="px-8">
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </Card>

            {/* Sécurité - Mot de passe */}
            <Card variant="institutional" className="p-8">
              <h2 className="text-lg font-black text-surface-800 uppercase tracking-widest mb-8 flex items-center border-b border-secondary-50 pb-4">
                <ShieldCheckIcon className="w-6 h-6 mr-3 text-amber-500" />
                Sécurité du Compte
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Confirmer</label>
                    <input
                      type="password"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={loading} className="px-8">
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Email */}
            <Card variant="institutional" className="p-8">
              <h2 className="text-sm font-black text-surface-800 uppercase tracking-widest mb-6 flex items-center border-b border-secondary-50 pb-4">
                <EnvelopeIcon className="w-5 h-5 mr-3 text-secondary-500" />
                Adresse Email
              </h2>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    disabled={emailStep === 2}
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm disabled:opacity-50"
                  />
                </div>
                {emailStep === 2 && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">Code de vérification</label>
                    <input
                      type="text"
                      value={emailForm.code}
                      onChange={(e) => setEmailForm({ ...emailForm, code: e.target.value })}
                      className="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-center text-xl tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                )}
                <Button type="submit" variant="primary" loading={loading} className="w-full">
                  {emailStep === 1 ? 'Changer l\'email' : 'Vérifier le code'}
                </Button>
                {emailStep === 2 && (
                  <button 
                    type="button" 
                    onClick={() => setEmailStep(1)}
                    className="w-full text-[10px] font-black text-secondary-400 uppercase tracking-widest hover:text-primary-500 transition-colors"
                  >
                    Annuler le changement
                  </button>
                )}
              </form>
            </Card>

            {/* Infos Système */}
            <Card variant="institutional" className="p-6 bg-secondary-50 border-none shadow-none">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Membre depuis</span>
                  <span className="text-xs font-bold text-surface-800">{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Dernière connexion</span>
                  <span className="text-xs font-bold text-surface-800">{user?.date_derniere_connexion ? new Date(user.date_derniere_connexion).toLocaleString() : 'Inconnu'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
