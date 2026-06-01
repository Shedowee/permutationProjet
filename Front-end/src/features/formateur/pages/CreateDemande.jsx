import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { createDemande } from "../redux/formateurSlice";
import { useToast } from "../../../shared/context/useToast";
import { listParametres, listCitiesByRegion } from "../../../services/paramService";
import { listEtablissementsByCity } from "../../../services/etablissementsService";
import { getCurrentFormateur } from "../../../services/formateurService";
import { getDemande, updateDemande } from "../../../services/demandesService";
import { motion, AnimatePresence } from "framer-motion";
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
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  ShareIcon
} from "@heroicons/react/24/outline";

const aiTypeMeta = {
  direct: {
    label: "Correspondance directe",
    icon: BoltIcon,
    tone: "bg-emerald-50 border-emerald-200 text-emerald-800",
    message: "Une permutation directe a été trouvée. La commission est notifiée pour accélérer la validation.",
  },
  regional: {
    label: "Recommandation proche",
    icon: MapPinIcon,
    tone: "bg-sky-50 border-sky-200 text-sky-800",
    message: "Aucune permutation directe n'a été trouvée. Le moteur IA propose le meilleur rapprochement selon la région et la spécialité.",
  },
  multihop: {
    label: "Permutation par N",
    icon: ShareIcon,
    tone: "bg-violet-50 border-violet-200 text-violet-800",
    message: "Aucune correspondance simple n'a été trouvée. Une chaîne de permutation par N est possible et attend votre accord.",
  },
};

const CreateDemande = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { success: toastSuccess } = useToast();
  const editDemandeId = new URLSearchParams(location.search).get("edit");

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
  const [formateur, setFormateur] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingExistingDemande, setFetchingExistingDemande] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [fetchingEtabs, setFetchingEtabs] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdRecommendations, setCreatedRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); 

  const mapParametre = (item) => ({
    id: item.id,
    libelle: item.value?.libelle || item.key || item.name || "",
  });

  const mapEtablissement = (item) => ({
    id: item.id,
    nom: item.name || item.nom || "",
  });

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setFetchingData(true);
        const [regionsData, formateurData] = await Promise.all([
          listParametres({ type: "REGION" }),
          getCurrentFormateur()
        ]);
        
        if (!mounted) return;
        setRegions((regionsData || []).map(mapParametre));
        setFormateur(formateurData);
      } catch {
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
    if (!editDemandeId) {
      return;
    }

    let mounted = true;
    const loadExistingDemande = async () => {
      try {
        setFetchingExistingDemande(true);
        const demande = await getDemande(editDemandeId);
        if (!mounted) return;

        if (demande?.etat?.key !== "EN_ATTENTE") {
          setError("Cette demande ne peut être modifiée que lorsqu'elle est en attente.");
          navigate("/formateur/demandes", { replace: true });
          return;
        }

        setFormData({
          motif: demande.motif || "",
          regionSouhaiteeId: demande.region_souhaitee_id ? String(demande.region_souhaitee_id) : "",
          villeSouhaiteeId: demande.ville_souhaitee_id ? String(demande.ville_souhaitee_id) : "",
          etablissementSouhaiteId: demande.etablissement_souhaite_id ? String(demande.etablissement_souhaite_id) : "",
          document: null,
        });
        setStep(1);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Impossible de charger la demande à modifier.");
      } finally {
        if (mounted) setFetchingExistingDemande(false);
      }
    };

    loadExistingDemande();
    return () => {
      mounted = false;
    };
  }, [editDemandeId, navigate]);

  useEffect(() => {
    if (formData.regionSouhaiteeId) {
      const loadCities = async () => {
        try {
          setFetchingCities(true);
          const data = await listCitiesByRegion(formData.regionSouhaiteeId);
          setCities((data || []).map(mapParametre));
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
          setEtablissements((data || []).map(mapEtablissement));
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setCreatedRecommendations([]);

    const data = new FormData();
    data.append('motif', formData.motif);
    data.append('region_souhaitee_id', formData.regionSouhaiteeId);
    data.append('ville_souhaitee_id', formData.villeSouhaiteeId);
    data.append('etablissement_souhaite_id', formData.etablissementSouhaiteId);
    if (formData.document) {
      data.append('document', formData.document);
    }

    try {
      if (editDemandeId) {
        await updateDemande(editDemandeId, data);
        toastSuccess("Votre demande a été modifiée avec succès");
        navigate("/formateur/demandes", { replace: true });
        return;
      }

      const created = await dispatch(createDemande(data)).unwrap();
      const recommendationsCount = Array.isArray(created?.aiRecommendations) ? created.aiRecommendations.length : 0;
      setCreatedRecommendations(created?.aiRecommendations || []);

      toastSuccess(
        recommendationsCount > 0
          ? "Votre demande a été créée et le moteur IA a trouvé une recommandation."
          : "Votre demande a été créée. Le moteur IA poursuivra l'analyse automatiquement."
      );
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
    } catch (err) {
      setError(err.message || "Erreur lors de la création de la demande");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedCity = cities.find(c => c.id === Number(formData.villeSouhaiteeId));
  const selectedEtab = etablissements.find(e => e.id === Number(formData.etablissementSouhaiteId));
  const currentEtablissement =
    formateur?.etablissement?.name ||
    formateur?.etablissement?.nom ||
    "—";
  const currentRegion =
    formateur?.etablissement?.ville?.region?.value?.libelle ||
    formateur?.etablissement?.ville?.region?.libelle ||
    formateur?.etablissement?.ville?.region?.name ||
    "—";

  if (fetchingData || fetchingExistingDemande) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">
            {editDemandeId ? "Chargement de la demande..." : "Préparation du formulaire..."}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase flex items-center gap-4">
              <div className="p-3 bg-primary-500 text-white rounded-lg shadow-primary">
                <DocumentPlusIcon className="h-8 w-8" />
              </div>
              {editDemandeId ? "Modifier Demande" : "Nouvelle Demande"}
            </h1>
            <p className="text-surface-500 mt-2 font-bold uppercase tracking-widest text-[10px] ml-20">
              {editDemandeId ? "Ajustez votre demande de permutation en attente" : "Soumettez votre demande de permutation"}
            </p>
          </motion.div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border-2 border-jb-green/20 shadow-soft self-end md:self-auto">
            <div className={`h-2 w-16 rounded-full transition-standard ${step === 1 ? 'bg-primary-500 shadow-primary' : 'bg-surface-100'}`}></div>
            <div className={`h-2 w-16 rounded-full transition-standard ${step === 2 ? 'bg-primary-500 shadow-primary' : 'bg-surface-100'}`}></div>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-primary-50 border border-primary-100 rounded-lg flex items-start gap-5 shadow-soft"
            >
              <div className="p-2 bg-primary-500 text-white rounded-xl">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-primary-900 font-black uppercase tracking-widest text-xs">Demande enregistrée !</h3>
                <p className="text-primary-700 text-sm mt-1 font-bold">
                  Votre dossier est enregistré et analysé par le moteur de matching.
                </p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-red-50 border border-red-100 rounded-lg flex items-start gap-5 shadow-soft"
            >
              <div className="p-2 bg-red-500 text-white rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-red-900 font-black uppercase tracking-widest text-xs">Une erreur est survenue</h3>
                <p className="text-red-700 text-sm mt-1 font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {createdRecommendations.length > 0 && (
          <AiResultSummary
            recommendations={createdRecommendations}
            onOpen={() => navigate("/formateur")}
          />
        )}

        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-10">
              <form onSubmit={handleNext} className="space-y-12">
                {/* Infos Actuelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-surface-50 rounded-lg border-2 border-jb-cyan/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-standard">
                    <BuildingOfficeIcon className="w-24 h-24" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Affectation Actuelle</p>
                    <p className="text-surface-900 font-black text-xl tracking-tight">{currentEtablissement}</p>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Région Administrative</p>
                    <p className="text-surface-900 font-black text-xl tracking-tight">{currentRegion}</p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="flex items-center gap-3 border-b-2 border-jb-green/15 pb-6">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                      <MapPinIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-black text-surface-900 uppercase tracking-[0.3em]">
                      Destination Souhaitée
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="label-text ml-1">Région *</label>
                      <select
                        name="regionSouhaiteeId"
                        value={formData.regionSouhaiteeId}
                        onChange={handleChange}
                        className="input-field py-4 cursor-pointer font-bold"
                      >
                        <option value="">Choisir une région</option>
                        {regions.map((r) => (
                          <option key={r.id} value={r.id}>{r.libelle}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="label-text ml-1">Ville *</label>
                      <div className="relative">
                        <select
                          name="villeSouhaiteeId"
                          value={formData.villeSouhaiteeId}
                          onChange={handleChange}
                          disabled={!formData.regionSouhaiteeId || fetchingCities}
                          className="input-field py-4 cursor-pointer font-bold disabled:bg-surface-50"
                        >
                          <option value="">Choisir une ville</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.id}>{c.libelle}</option>
                          ))}
                        </select>
                        {fetchingCities && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="label-text ml-1">Établissement *</label>
                      <div className="relative">
                        <select
                          name="etablissementSouhaiteId"
                          value={formData.etablissementSouhaiteId}
                          onChange={handleChange}
                          disabled={!formData.villeSouhaiteeId || fetchingEtabs}
                          className="input-field py-4 cursor-pointer font-bold disabled:bg-surface-50"
                        >
                          <option value="">Choisir un établissement</option>
                          {etablissements.map((e) => (
                            <option key={e.id} value={e.id}>{e.nom}</option>
                          ))}
                        </select>
                        {fetchingEtabs && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="label-text ml-1">Explication du motif *</label>
                        <textarea
                          name="motif"
                          value={formData.motif}
                          onChange={handleChange}
                          rows="3"
                          className="input-field py-4 min-h-[96px] max-h-32 resize-none font-bold"
                          placeholder="Précisez les raisons de votre demande..."
                        />
                      <div className="flex justify-between px-2">
                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Min. 10 caractères</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${formData.motif.length < 10 ? 'text-red-500' : 'text-primary-600'}`}>
                          {formData.motif.length} / 10
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="label-text ml-1">Justificatifs (Optionnel)</label>
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
                          className={`flex items-center justify-between px-8 py-6 bg-surface-50 border-2 border-dashed rounded-lg cursor-pointer transition-standard group ${
                            formData.document ? 'border-primary-500 bg-primary-50/20' : 'border-jb-cyan/20 hover:border-primary-300 hover:bg-primary-50/10'
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`p-3.5 rounded-lg transition-standard ${formData.document ? 'bg-primary-500 text-white shadow-primary' : 'bg-white text-surface-400 shadow-soft group-hover:text-primary-500'}`}>
                              <PaperClipIcon className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                              <p className={`text-sm font-black transition-colors ${formData.document ? 'text-surface-900' : 'text-surface-500 group-hover:text-primary-600'}`}>
                                {formData.document ? formData.document.name : "Joindre un document (PDF, JPG, PNG)"}
                              </p>
                              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Taille maximale : 5 Mo</p>
                            </div>
                          </div>
                          {formData.document && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData(prev => ({ ...prev, document: null }));
                              }}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-standard"
                            >
                              <XMarkIcon className="h-6 w-6" />
                            </button>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t-2 border-jb-cyan/15 flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    className="px-12 shadow-primary group"
                  >
                    <span>{editDemandeId ? "Prévisualiser les modifications" : "Continuer"}</span>
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-standard" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <Card className="p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/20 rounded-full -mr-48 -mt-48 blur-3xl group-hover:scale-110 transition-standard"></div>
              
              <h2 className="text-xl font-black text-surface-900 mb-12 tracking-tight flex items-center gap-4 border-b-2 border-jb-green/15 pb-6 relative z-10">
                <div className="p-2 bg-primary-500 text-white rounded-xl">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                Récapitulatif du dossier
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="flex-1 space-y-3">
                      <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">De</p>
                      <div className="bg-surface-50 p-5 rounded-lg border-2 border-jb-cyan/20">
                        <p className="text-surface-900 font-black text-sm">{currentEtablissement}</p>
                        <p className="text-primary-600 text-[10px] mt-1 font-black uppercase tracking-widest">{currentRegion}</p>
                      </div>
                    </div>
                    <div className="shrink-0 w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-primary">
                      <ArrowRightIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Vers</p>
                      <div className="bg-primary-50/30 p-5 rounded-lg border border-primary-100 shadow-soft">
                        <p className="text-surface-900 font-black text-sm">{selectedEtab?.nom}</p>
                        <p className="text-primary-600 text-[10px] mt-1 font-black uppercase tracking-widest">{selectedCity?.libelle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Pièce jointe</p>
                    {formData.document ? (
                      <div className="flex items-center gap-4 p-5 bg-white rounded-lg border-2 border-jb-green/20 shadow-soft">
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                          <DocumentTextIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-surface-900 truncate">{formData.document.name}</p>
                          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{(formData.document.size / 1024).toFixed(1)} Ko</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-surface-50 rounded-lg border-2 border-dashed border-jb-cyan/20 text-center">
                        <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest italic">Aucun justificatif fourni</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">Justification du motif</p>
                  <div className="bg-surface-50 p-8 rounded-lg border-2 border-jb-green/20 h-full">
                    <p className="text-surface-700 font-bold italic leading-relaxed text-sm">
                      "{formData.motif}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-4">
                <InformationCircleIcon className="h-6 w-6 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 font-bold leading-relaxed">
                  Important : En validant cet envoi, vous attestez sur l'honneur de la véracité des informations transmises. 
                  Toute fausse déclaration peut entraîner l'annulation de la demande.
                </p>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-surface-400 hover:text-primary-600 font-black uppercase tracking-widest text-[10px] transition-standard group"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-standard" />
                <span>Modifier les informations</span>
              </button>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="flex-1 sm:flex-none px-10"
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmit} 
                  loading={loading}
                  className="flex-1 sm:flex-none px-12 shadow-primary"
                >
                  {editDemandeId ? "Enregistrer les modifications" : "Envoyer le dossier"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

const AiResultSummary = ({ recommendations, onOpen }) => {
  const best = [...recommendations].sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0];
  if (!best) {
    return null;
  }

  const meta = aiTypeMeta[best.type] || aiTypeMeta.regional;
  const Icon = meta.icon;
  const chain = Array.isArray(best.chain) ? best.chain : [];

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`p-6 border ${meta.tone}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-white/80 border border-white/70 flex items-center justify-center shadow-soft">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em]">Résultat IA</p>
              <h2 className="mt-1 text-xl font-black tracking-tight">{meta.label}</h2>
              <p className="mt-2 text-sm font-bold leading-6">{best.summary || meta.message}</p>
              <p className="mt-2 text-xs font-bold opacity-80">{meta.message}</p>
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-white/80 border border-white/70 px-5 py-4 text-center shadow-soft">
            <p className="text-3xl font-black">{Math.round(Number(best.score || 0))}%</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest opacity-70">Compatibilité</p>
          </div>
        </div>

        {chain.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {chain.map((step, index) => (
              <span key={`${step.demande_id || index}-${index}`} className="rounded-lg bg-white/80 border border-white/70 px-3 py-2 text-xs font-black">
                {`${step.from || "Origine"} -> ${step.to || "Cible"}`}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="primary" size="sm" onClick={onOpen}>
            Voir dans mon tableau de bord
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CreateDemande;
