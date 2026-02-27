import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { createDemande } from "../redux/formateurSlice";
import { useAuth } from "../../../auth/hooks/useAuth";
import { listParametres, listCitiesByRegion } from "../../../services/paramService";
import { listEtablissementsByCity } from "../../../services/etablissementsService";
import { getCurrentEmploye } from "../../../services/employeService";
import { 
  DocumentPlusIcon, 
  InformationCircleIcon, 
  MapPinIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  DocumentTextIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const CreateDemande = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    motif: "",
    regionSouhaiteeId: "",
    villeSouhaiteeId: "",
    etablissementSouhaiteId: "",
    document: null,
  });
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [fetchingEtabs, setFetchingEtabs] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); 

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setFetchingData(true);
        const [regionsData, employeData] = await Promise.all([
          listParametres({ type: "REGION" }),
          getCurrentEmploye()
        ]);
        
        if (!mounted) return;
        setRegions(regionsData || []);
        setEmploye(employeData);
      } catch (err) {
        if (!mounted) return;
        setError("Erreur de chargement des données. Veuillez réessayer.");
      } finally {
        if (mounted) setFetchingData(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (formData.regionSouhaiteeId) {
      const loadCities = async () => {
        try {
          setFetchingCities(true);
          const data = await listCitiesByRegion(formData.regionSouhaiteeId);
          setCities(data || []);
        } catch (err) {
          console.error("Erreur villes:", err);
        } finally {
          setFetchingCities(false);
        }
      };
      loadCities();
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, villeSouhaiteeId: "", etablissementSouhaiteId: "" }));
    }
  }, [formData.regionSouhaiteeId]);

  useEffect(() => {
    if (formData.villeSouhaiteeId) {
      const loadEtabs = async () => {
        try {
          setFetchingEtabs(true);
          const data = await listEtablissementsByCity(formData.villeSouhaiteeId);
          setEtablissements(data || []);
        } catch (err) {
          console.error("Erreur etabs:", err);
        } finally {
          setFetchingEtabs(false);
        }
      };
      loadEtabs();
    } else {
      setEtablissements([]);
      setFormData(prev => ({ ...prev, etablissementSouhaiteId: "" }));
    }
  }, [formData.villeSouhaiteeId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData(prev => ({ ...prev, document: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.motif.trim() || formData.motif.length < 10) {
      setError("Le motif doit faire au moins 10 caractères.");
      return false;
    }
    if (!formData.regionSouhaiteeId) {
      setError("Veuillez sélectionner une région souhaitée.");
      return false;
    }
    if (!formData.villeSouhaiteeId) {
      setError("Veuillez sélectionner une ville souhaitée.");
      return false;
    }
    if (!formData.etablissementSouhaiteId) {
      setError("Veuillez sélectionner un établissement souhaité.");
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append('motif', formData.motif);
    data.append('region_souhaitee_id', formData.regionSouhaiteeId);
    data.append('ville_souhaitee_id', formData.villeSouhaiteeId);
    data.append('etablissement_souhaite_id', formData.etablissementSouhaiteId);
    if (formData.document) {
      data.append('document', formData.document);
    }

    try {
      await dispatch(createDemande(data)).unwrap();

      setSuccess(true);
      setStep(1);
      setFormData({
        motif: "",
        regionSouhaiteeId: "",
        villeSouhaiteeId: "",
        etablissementSouhaiteId: "",
        document: null,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Erreur lors de la création de la demande");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedRegion = regions.find(r => r.id === Number(formData.regionSouhaiteeId));
  const selectedCity = cities.find(c => c.id === Number(formData.villeSouhaiteeId));
  const selectedEtab = etablissements.find(e => e.id === Number(formData.etablissementSouhaiteId));

  if (fetchingData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-secondary-600 font-bold uppercase tracking-widest text-xs">Préparation du formulaire...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-surface-800 tracking-tight flex items-center">
              <DocumentPlusIcon className="h-10 w-10 mr-4 text-primary-500" />
              Nouvelle Demande
            </h1>
            <p className="text-secondary-700 mt-2 font-medium italic">
              Soumettez votre demande de permutation professionnelle.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step === 1 ? 'bg-primary-500' : 'bg-primary-100'}`}></div>
            <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step === 2 ? 'bg-primary-500' : 'bg-primary-100'}`}></div>
          </div>
        </div>

        {success && (
          <div className="p-6 bg-primary-50 border border-primary-200 rounded-2xl flex items-start space-x-4 animate-fadeIn shadow-sm">
            <CheckCircleIcon className="h-8 w-8 text-primary-600 shrink-0" />
            <div>
              <h3 className="text-primary-900 font-black uppercase tracking-widest text-sm">Demande enregistrée !</h3>
              <p className="text-primary-800/80 text-sm mt-1 font-medium">
                Votre demande a été soumise avec succès. Vous pouvez suivre son avancement dans votre tableau de bord.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-4 animate-fadeIn shadow-sm">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 shrink-0" />
            <div>
              <h3 className="text-red-900 font-black uppercase tracking-widest text-sm">Action impossible</h3>
              <p className="text-red-800 text-sm mt-1 font-medium">{error}</p>
            </div>
          </div>
        )}

        {step === 1 ? (
          <Card variant="institutional" className="p-10 rounded-2xl border-secondary-100 shadow-xl bg-white/80 backdrop-blur-xl">
            <form onSubmit={handleNext} className="space-y-10">
              {/* Infos Actuelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-secondary-50/50 rounded-2xl border border-secondary-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">Établissement Actuel</p>
                  <p className="text-surface-800 font-bold text-lg">{employe?.etablissement?.nom || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">Région Actuelle</p>
                  <p className="text-surface-800 font-bold text-lg">{employe?.region?.libelle || "—"}</p>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black text-surface-800 uppercase tracking-[0.3em] flex items-center border-b border-secondary-100 pb-4">
                  <MapPinIcon className="h-5 w-5 mr-3 text-primary-500" />
                  Destination Souhaitée
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] ml-1">Région *</label>
                    <select
                      name="regionSouhaiteeId"
                      value={formData.regionSouhaiteeId}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-secondary-50/50 border border-secondary-200 rounded-xl text-surface-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Choisir une région</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] ml-1">Ville *</label>
                    <div className="relative">
                      <select
                        name="villeSouhaiteeId"
                        value={formData.villeSouhaiteeId}
                        onChange={handleChange}
                        disabled={!formData.regionSouhaiteeId || fetchingCities}
                        className="w-full px-4 py-4 bg-secondary-50/50 border border-secondary-200 rounded-xl text-surface-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Choisir une ville</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>{c.libelle}</option>
                        ))}
                      </select>
                      {fetchingCities && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] ml-1">Établissement *</label>
                    <div className="relative">
                      <select
                        name="etablissementSouhaiteId"
                        value={formData.etablissementSouhaiteId}
                        onChange={handleChange}
                        disabled={!formData.villeSouhaiteeId || fetchingEtabs}
                        className="w-full px-4 py-4 bg-secondary-50/50 border border-secondary-200 rounded-xl text-surface-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Choisir un établissement</option>
                        {etablissements.map((e) => (
                          <option key={e.id} value={e.id}>{e.nom}</option>
                        ))}
                      </select>
                      {fetchingEtabs && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] ml-1">Motif de la demande *</label>
                    <textarea
                      name="motif"
                      value={formData.motif}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-6 py-5 bg-secondary-50/50 border border-secondary-200 rounded-2xl text-surface-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none font-medium leading-relaxed"
                      placeholder="Expliquez en détail les raisons de votre demande (rapprochement familial, santé, convenance personnelle...)"
                    />
                    <div className="flex justify-between px-2">
                      <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Min. 10 caractères</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${formData.motif.length < 10 ? 'text-red-500' : 'text-primary-600'}`}>
                        {formData.motif.length} caractères
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] ml-1">Documents de support (Optionnel)</label>
                    <div className="relative">
                      <input
                        type="file"
                        name="document"
                        id="document-upload"
                        onChange={handleChange}
                        className="hidden"
                        accept=".pdf,image/*"
                      />
                      <label
                        htmlFor="document-upload"
                        className={`flex items-center justify-between px-6 py-5 bg-secondary-50/50 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${
                          formData.document ? 'border-primary-500 bg-primary-50/30' : 'border-secondary-200 hover:border-primary-400 hover:bg-primary-50/10'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl transition-all ${formData.document ? 'bg-primary-500 text-white' : 'bg-white text-secondary-400 shadow-sm group-hover:text-primary-500'}`}>
                            <PaperClipIcon className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-black transition-colors ${formData.document ? 'text-surface-800' : 'text-secondary-700 group-hover:text-primary-500'}`}>
                              {formData.document ? formData.document.name : "Joindre un document justificatif"}
                            </p>
                            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">PDF, JPG, PNG • Max 5MB</p>
                          </div>
                        </div>
                        {formData.document && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormData(prev => ({ ...prev, document: null }));
                            }}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-secondary-100 flex justify-end">
                <Button type="submit" variant="primary" className="px-12 py-5 rounded-xl flex items-center space-x-3 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20 group">
                  <span>Récapitulatif</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <Card variant="institutional" className="p-10 rounded-2xl border-primary-100 bg-primary-50/30 backdrop-blur-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              
              <h2 className="text-2xl font-black text-surface-800 mb-10 tracking-tight flex items-center border-b border-primary-100 pb-4">
                <CheckCircleIcon className="h-8 w-8 mr-3 text-primary-500" />
                Vérification de votre demande
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-10">
                  <div className="flex items-center space-x-8">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em] mb-3">Établissement Actuel</p>
                      <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm">
                        <p className="text-surface-800 font-bold">{employe?.etablissement?.nom}</p>
                        <p className="text-secondary-600 text-xs mt-1 font-medium italic">{employe?.region?.libelle}</p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-500/20">
                      <ArrowRightIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em] mb-3">Destination Souhaitée</p>
                      <div className="bg-white p-5 rounded-xl border border-secondary-100 shadow-sm">
                        <p className="text-surface-800 font-bold">{selectedEtab?.nom}</p>
                        <p className="text-primary-600 text-xs mt-1 font-black uppercase tracking-widest">{selectedCity?.libelle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em] ml-1">Document Justificatif</p>
                    {formData.document ? (
                      <div className="flex items-center space-x-4 p-5 bg-white rounded-xl border border-secondary-100 shadow-sm">
                        <div className="p-3 bg-secondary-50 rounded-lg text-secondary-600">
                          <DocumentTextIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-surface-800 truncate">{formData.document.name}</p>
                          <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">{(formData.document.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-secondary-50/30 rounded-xl border border-dashed border-secondary-200 text-center">
                        <p className="text-secondary-400 text-xs font-bold uppercase tracking-widest italic">Aucun document joint</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-secondary-100 shadow-sm space-y-4">
                  <p className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">Explication du motif</p>
                  <p className="text-secondary-800 font-medium italic leading-relaxed text-sm">
                    "{formData.motif}"
                  </p>
                </div>
              </div>

              <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-4">
                <InformationCircleIcon className="h-6 w-6 text-amber-700 shrink-0" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  En soumettant cette demande, vous confirmez l'exactitude des informations fournies. 
                  Votre dossier sera examiné par la commission nationale de permutation. 
                  Vous recevrez une notification dès que votre demande aura été traitée.
                </p>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center space-x-2 text-secondary-400 hover:text-surface-800 font-black uppercase tracking-[0.2em] text-[10px] transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Retour au formulaire</span>
              </button>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="px-10 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest border-secondary-200 text-secondary-700"
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmit} 
                  loading={loading}
                  className="px-12 py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20"
                >
                  Confirmer et Envoyer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateDemande;
