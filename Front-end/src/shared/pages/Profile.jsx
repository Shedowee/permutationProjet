import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useToast } from "../context/useToast";
import { updateProfile, updatePassword, updateEmail } from "../../services/userService";
import { updateProfilePicture } from "../../services/usersService";
import { listParametres, listCitiesByRegion } from "../../services/paramService";
import { listEtablissementsByCity } from "../../services/etablissementsService";
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
    name: user?.name || user?.nom || "",
    age: user?.age || "",
    phone: user?.phone || "",
    address: user?.address || "",
    specialite: user?.formateur?.specialite || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  const [emailForm, setEmailForm] = useState({
    email: user?.email || ""
  });
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    region_id: "",
    city_id: "",
    establishment_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const fileInputRef = useRef(null);
  const formateurEtablissement = user?.formateur?.etablissement?.name || "—";
  const formateurRegion = user?.formateur?.etablissement?.ville?.region?.value?.libelle || "—";

  const mapParametre = (item) => ({
    id: item.id,
    libelle: item.value?.libelle || item.key || item.name || "",
  });

  const mapEtablissement = (item) => ({
    id: item.id,
    nom: item.name || item.nom || "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || user.nom || "",
        age: user.age || "",
        phone: user.phone || "",
        address: user.address || "",
        specialite: user?.formateur?.specialite || "",
      });
      setEmailForm({ email: user.email });
      setAssignmentForm({
        region_id: user?.formateur?.etablissement?.ville?.region?.id ? String(user.formateur.etablissement.ville.region.id) : "",
        city_id: user?.formateur?.etablissement?.ville?.id ? String(user.formateur.etablissement.ville.id) : "",
        establishment_id: user?.formateur?.establishment_id
          ? String(user.formateur.establishment_id)
          : user?.formateur?.etablissement?.id
            ? String(user.formateur.etablissement.id)
            : "",
      });
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const loadRegions = async () => {
      try {
        const data = await listParametres({ type: "REGION" });
        if (!mounted) return;
        setRegions((data || []).map(mapParametre));
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    };
    loadRegions();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!assignmentForm.region_id) {
      setCities([]);
      setEtablissements([]);
      return;
    }

    let mounted = true;
    const loadCities = async () => {
      try {
        const data = await listCitiesByRegion(assignmentForm.region_id);
        if (!mounted) return;
        setCities((data || []).map(mapParametre));
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    };

    loadCities();
    return () => {
      mounted = false;
    };
  }, [assignmentForm.region_id]);

  useEffect(() => {
    if (!assignmentForm.city_id) {
      setEtablissements([]);
      return;
    }

    let mounted = true;
    const loadEtablissements = async () => {
      try {
        const data = await listEtablissementsByCity(assignmentForm.city_id);
        if (!mounted) return;
        setEtablissements((data || []).map(mapEtablissement));
      } catch (err) {
        console.error("Failed to load establishments", err);
      }
    };

    loadEtablissements();
    return () => {
      mounted = false;
    };
  }, [assignmentForm.city_id]);

  const currentRegionId = user?.formateur?.etablissement?.ville?.region?.id ? String(user.formateur.etablissement.ville.region.id) : "";
  const currentCityId = user?.formateur?.etablissement?.ville?.id ? String(user.formateur.etablissement.ville.id) : "";
  const currentEstablishmentId = user?.formateur?.establishment_id
    ? String(user.formateur.establishment_id)
    : user?.formateur?.etablissement?.id
      ? String(user.formateur.etablissement.id)
      : "";

  const selectedRegion = regions.find((r) => String(r.id) === String(assignmentForm.region_id));
  const selectedCity = cities.find((c) => String(c.id) === String(assignmentForm.city_id));
  const selectedEtablissement = etablissements.find((e) => String(e.id) === String(assignmentForm.establishment_id));

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setPictureLoading(true);
      await updateProfilePicture(formData);
      await refreshUser();
      success("Photo de profil mise à jour avec succès");
    } catch (err) {
      toastError(err.response?.data?.message || "Erreur lors de l'upload de la photo");
    } finally {
      setPictureLoading(false);
      e.target.value = "";
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...profileForm,
      };

      if (role === "formateur" || user?.formateur) {
        payload.region_id = assignmentForm.region_id;
        payload.city_id = assignmentForm.city_id;
        payload.establishment_id = assignmentForm.establishment_id;
        payload.specialite = profileForm.specialite;
      }

      if (payload.region_id || payload.city_id || payload.establishment_id) {
        setAssignmentLoading(true);
      }

      await updateProfile(payload);
      await refreshUser();
      success("Profil mis à jour avec succès");
    } catch (err) {
      toastError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
      setAssignmentLoading(false);
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
      const res = await updateEmail(emailForm.email);
      await refreshUser();
      if (res?.mail_sent === false) {
        info("Adresse email mise à jour, mais le lien de vérification n'a pas pu être envoyé. Vérifiez la configuration mail.");
      } else {
        info("Adresse email mise à jour. Vérifiez votre boîte mail pour activer la nouvelle adresse.");
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
              <div className="p-3 bg-primary-500 text-white rounded-lg shadow-primary">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              Mon Profil
            </h1>
            <p className="text-surface-500 mt-2 font-bold uppercase tracking-widest text-[10px] ml-20">
              Gérez vos informations personnelles et votre sécurité
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-surface-100 shadow-soft self-end md:self-auto">
            <ShieldCheckIcon className="h-5 w-5 text-primary-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-surface-900">{role || "Aucun rôle"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Quick Info */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-standard"></div>
              
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary-500 rounded-lg mx-auto flex items-center justify-center text-white text-4xl font-black shadow-primary overflow-hidden relative">
                  {user?.photo_url ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/storage/${user.photo_url}`}
                      alt="Profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (user?.name || user?.nom || "U")[0].toUpperCase()
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Changer la photo de profil"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Changer</span>
                  </button>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-soft flex items-center justify-center border border-surface-100">
                  <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={pictureLoading}
                className="mb-6 w-full"
              >
                Changer la photo
              </Button>
              
              <h2 className="text-xl font-black text-surface-900 tracking-tight">{user?.name || user?.nom}</h2>
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
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-surface-400">Téléphone</span>
                  <span className="text-surface-900">{user?.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-surface-400">Âge</span>
                  <span className="text-surface-900">{user?.age || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-surface-400">Adresse</span>
                  <span className="text-surface-900 text-right max-w-[12rem] truncate">{user?.address || "—"}</span>
                </div>
                {(role === "formateur" || user?.formateur) && (
                  <>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-surface-400">Spécialité</span>
                      <span className="text-surface-900 text-right max-w-[12rem] truncate">{user?.formateur?.specialite || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-surface-400">Établissement</span>
                      <span className="text-surface-900 text-right max-w-[12rem] truncate">{formateurEtablissement}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-surface-400">Région</span>
                      <span className="text-surface-900 text-right max-w-[12rem] truncate">{formateurRegion}</span>
                    </div>
                  </>
                )}
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
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
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
                {(role === "formateur" || user?.formateur) && (
                  <div className="md:col-span-2 space-y-6 pt-2">
                    <div className="space-y-3 md:max-w-xl">
                      <label className="label-text ml-1">Spécialité</label>
                      <input
                        type="text"
                        value={profileForm.specialite}
                        onChange={(e) => setProfileForm({ ...profileForm, specialite: e.target.value })}
                        className="input-field"
                        placeholder="Ex: Génie logiciel, Réseaux, Comptabilité"
                      />
                      <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest ml-1">
                        Utilisée pour les permutations compatibles
                      </p>
                    </div>

                    <div className="flex items-center gap-3 border-b border-surface-50 pb-4">
                      <MapPinIcon className="h-5 w-5 text-primary-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-900">
                        Affectation actuelle
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="label-text ml-1">Région</label>
                        <select
                          value={assignmentForm.region_id}
                          onChange={(e) => {
                            const region_id = e.target.value;
                            setAssignmentForm({
                              region_id,
                              city_id: "",
                              establishment_id: "",
                            });
                          }}
                          className="input-field py-4 cursor-pointer font-bold"
                        >
                          <option value="">Choisir une région</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.libelle}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="label-text ml-1">Ville</label>
                        <select
                          value={assignmentForm.city_id}
                          onChange={(e) => {
                            const city_id = e.target.value;
                            setAssignmentForm((prev) => ({
                              ...prev,
                              city_id,
                              establishment_id: "",
                            }));
                          }}
                          disabled={!assignmentForm.region_id}
                          className="input-field py-4 cursor-pointer font-bold disabled:bg-surface-50"
                        >
                          <option value="">Choisir une ville</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.libelle}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="label-text ml-1">Établissement</label>
                        <select
                          value={assignmentForm.establishment_id}
                          onChange={(e) => {
                            setAssignmentForm((prev) => ({
                              ...prev,
                              establishment_id: e.target.value,
                            }));
                          }}
                          disabled={!assignmentForm.city_id}
                          className="input-field py-4 cursor-pointer font-bold disabled:bg-surface-50"
                        >
                          <option value="">Choisir un établissement</option>
                          {etablissements.map((etab) => (
                            <option key={etab.id} value={etab.id}>
                              {etab.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-primary-50/40 border border-primary-100 rounded-lg p-5 text-sm font-bold text-surface-700">
                      <p className="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-2">
                        Aperçu de l'affectation
                      </p>
                      <p>{selectedRegion?.libelle || "—"} / {selectedCity?.libelle || "—"} / {selectedEtablissement?.nom || "—"}</p>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2 pt-4">
                    <Button type="submit" variant="primary" loading={loading || assignmentLoading} className="w-full md:w-auto px-12">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="label-text ml-1">Nouvel Email</label>
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ email: e.target.value })}
                      className="input-field"
                      placeholder="nouveau@email.com"
                    />
                  </div>
                  <Button type="submit" variant="secondary" loading={loading} className="px-12">
                    Mettre à jour l'email
                  </Button>
                </div>
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
