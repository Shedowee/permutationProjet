import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import Button from "../../../shared/components/Button";
import DetailDemande from "../../formateur/components/DetailDemande";
import Modal from "../../../shared/components/Modal";
import { fetchDemandes, traiterDemande } from "../redux/commissionSlice";
import { listParametres } from "../../../services/paramService";
import { listEtablissementsByCity } from "../../../services/etablissementsService";
import { getDemande } from "../../../services/demandesService";
import { selectSearchTerm } from "../../../shared/redux/searchSlice";
import { useAuth } from "../../../auth/hooks/useAuth";
import {
  EyeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  InboxIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const DemandesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const { user, role } = useAuth();
  const allDemandes = useSelector((state) => state.commission.demandes.data);
  const meta = useSelector((state) => state.commission.demandes.meta);
  const loading = useSelector((state) => state.commission.demandes.loading);
  const error = useSelector((state) => state.commission.demandes.error);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [etabs, setEtabs] = useState([]);
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [etabId, setEtabId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const pageSize = 4;
  const accountStatus = String(user?.status || "").toLowerCase();
  const canAccessDemandes = ["commission", "admin"].includes(role) && ["active", "actif"].includes(accountStatus);

  useEffect(() => {
    if (!canAccessDemandes) {
      return;
    }

    dispatch(
      fetchDemandes({
        page: currentPage,
        limit: pageSize,
        filters: {
          search: searchTerm || globalSearchTerm,
          etat: status || undefined,
          region_id: regionId || undefined,
          ville_id: cityId || undefined,
          etablissement_id: etabId || undefined,
        },
      })
    );
  }, [dispatch, currentPage, searchTerm, globalSearchTerm, status, regionId, cityId, etabId, canAccessDemandes]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFromUrl = params.get("etat");
    if (statusFromUrl && statusFromUrl !== status) {
      setStatus(statusFromUrl.toUpperCase());
    } else if (!statusFromUrl && status) {
      setStatus("");
    }
  }, [location.search, status]);

  useEffect(() => {
    (async () => {
      try {
        const regs = await listParametres({ type: "REGION" });
        setRegions(regs.map((r) => ({ id: r.id, name: r.value?.libelle || r.key })));
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!regionId) {
        setCities([]);
        setCityId("");
        setEtabs([]);
        setEtabId("");
        return;
      }
      try {
        const villes = await listParametres({ type: "VILLE", parent_id: regionId });
        setCities(villes.map((v) => ({ id: v.id, name: v.value?.libelle || v.key })));
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    })();
  }, [regionId]);

  useEffect(() => {
    (async () => {
      if (!cityId) {
        setEtabs([]);
        setEtabId("");
        return;
      }
      try {
        const data = await listEtablissementsByCity(cityId);
        setEtabs(data.map((x) => ({ id: x.id, name: x.name })));
      } catch (err) {
        console.error("Failed to load establishments", err);
      }
    })();
  }, [cityId]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, globalSearchTerm, status, regionId, cityId, etabId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demandeId = params.get("demande");
    if (!demandeId) return;

    (async () => {
      try {
        const demande = await getDemande(demandeId);
        const reviewer = demande.traitePar ?? demande.traite_par ?? demande.processedBy ?? demande.processed_by ?? {};
        const reviewerFullName = [reviewer.prenom, reviewer.nom].filter(Boolean).join(' ');
        setSelectedDemande({
          id: demande.id,
          utilisateurId: demande.formateur?.user?.id ?? null,
          utilisateurNom:
            demande.formateur?.user?.name ??
            [demande.formateur?.nom, demande.formateur?.prenom].filter(Boolean).join(' ') ??
            '—',
          utilisateurEmail: demande.formateur?.user?.email ?? '—',
          utilisateurPhone: demande.formateur?.user?.phone ?? '—',
          utilisateurAddress: demande.formateur?.user?.address ?? '—',
          formateurEtablissement: demande.formateur?.etablissement?.name ?? '—',
          motif: demande.motif ?? '',
          dateDemande: demande.date_soumission?.split('T')[0] ?? '',
          dateDemandeComplete: demande.date_soumission ?? null,
          etat: demande.etat?.key ?? 'EN_ATTENTE',
          commentaire: demande.commentaire_commission ?? '',
          dateValidation: demande.date_traitement ?? null,
          traitePar: reviewer,
          traiteParNom: reviewer.name || reviewer.nom || reviewerFullName || reviewer.full_name || reviewer.fullName || '—',
          traiteParEmail: reviewer.email || reviewer.mail || '—',
          regionSouhaitee: demande.region_souhaitee?.value?.libelle ?? demande.region_souhaitee?.key ?? '—',
          villeSouhaitee: demande.ville_souhaitee?.value?.libelle ?? demande.ville_souhaitee?.key ?? '—',
          etablissementSouhaite: demande.etablissement_souhaite?.name ?? '—',
          documentJoint: demande.document_joint ?? null,
        });
        setShowDetailModal(true);
      } catch (err) {
        if (err?.response?.status === 404) {
          navigate("/not-found", {
            replace: true,
            state: {
              title: "Demande introuvable",
              message: "Cette demande a été supprimée ou n'existe plus.",
              returnTo: "/commission/demandes",
              returnLabel: "Retour aux permutations",
            },
          });
          return;
        }
        if (err?.response?.status === 403) {
          navigate("/profile", {
            replace: true,
            state: {
              message: "Cette permutation n'est pas accessible depuis votre compte actuel.",
            },
          });
          return;
        }
        console.error("Failed to load demande from notification", err);
      }
    })();
  }, [location.search, navigate]);

  if (!canAccessDemandes) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
          <h1 className="text-3xl font-black text-jb-text-primary uppercase tracking-tight">Accès limité</h1>
          <p className="text-jb-text-muted font-medium">
            Votre compte n'a pas encore accès aux permutations de commission. Vérifiez votre email puis attendez la validation administrative.
          </p>
          <Button variant="primary" onClick={() => navigate("/profile")}>
            Aller au profil
          </Button>
        </div>
      </Layout>
    );
  }

  const demandes = allDemandes || [];

  const handleViewDetail = (demande) => {
    setSelectedDemande(demande);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedDemande(null);
    setReviewComment("");
    const params = new URLSearchParams(location.search);
    params.delete("demande");
    const query = params.toString();
    navigate(query ? `/commission/demandes?${query}` : "/commission/demandes", { replace: true });
  };

  const handleReview = async (etat) => {
    if (!selectedDemande) return;
    try {
      setReviewLoading(true);
      await dispatch(traiterDemande({
        id: selectedDemande.id,
        etat,
        commentaire: reviewComment,
      })).unwrap();
      await dispatch(
        fetchDemandes({
          page: currentPage,
          limit: pageSize,
          filters: {
            search: searchTerm || globalSearchTerm,
            etat: status || undefined,
            region_id: regionId || undefined,
            ville_id: cityId || undefined,
            etablissement_id: etabId || undefined,
          },
        })
      );
      setReviewComment("");
      handleCloseDetail();
    } catch (err) {
      console.error("Failed to review demande", err);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-jb-text-primary tracking-tight uppercase">
              Toutes les permutations
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 rounded-full" style={{ background: 'var(--jb-gradient-primary)' }}></span>
              <p className="text-jb-text-muted font-black uppercase tracking-widest text-[10px]">
                Vue globale des demandes soumises par les formateurs
              </p>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/15 bg-red-500/5 p-6 flex items-start gap-4 text-red-700"
          >
            <p className="text-sm font-bold uppercase tracking-widest">Erreur: {error}</p>
          </motion.div>
        )}

        <Card noPadding className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-lg overflow-hidden shadow-[0_32px_76px_-44px_rgba(15,31,24,0.4)]">
          <div className="p-8 border-b border-white/70 bg-jb-bg-section/70 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl shadow-primary" style={{ background: 'var(--jb-gradient-primary)' }}>
                <InboxIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-jb-text-primary uppercase tracking-widest">
                  Permutations
                </h2>
                <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest mt-0.5">
                  Filtrer par état, région, ville et établissement
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group min-w-[300px]">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-jb-text-muted group-focus-within:text-jb-magenta transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher une permutation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#D8E9FB] border border-jb-border rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-jb-text-primary focus:border-jb-magenta outline-none transition-all placeholder:text-jb-text-muted"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-jb-text-muted hover:text-jb-red transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-jb-border rounded-xl px-4 py-3 text-sm font-bold text-jb-text-secondary">
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validée</option>
                <option value="REFUSE">Refusée</option>
              </select>

              <select value={regionId} onChange={(e) => { setRegionId(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-jb-border rounded-xl px-4 py-3 text-sm font-bold text-jb-text-secondary">
                <option value="">Toutes régions</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <select value={cityId} onChange={(e) => { setCityId(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-jb-border rounded-xl px-4 py-3 text-sm font-bold text-jb-text-secondary">
                <option value="">Toutes villes</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select value={etabId} onChange={(e) => { setEtabId(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-jb-border rounded-xl px-4 py-3 text-sm font-bold text-jb-text-secondary">
                <option value="">Tous établissements</option>
                {etabs.map((et) => <option key={et.id} value={et.id}>{et.name}</option>)}
              </select>
            </div>
          </div>

          <Table
            data={demandes}
            loading={loading}
            pagination={{
              currentPage,
              totalPages: meta?.last_page || 1,
              totalItems: meta?.total || 0,
              onPageChange: setCurrentPage,
              pageSize,
            }}
            columns={[
                  {
                    header: "Formateur",
                    key: "utilisateurNom",
                    render: (val, row) => (
                      <div className="flex flex-col">
                    <span className="text-sm font-black text-jb-text-primary uppercase tracking-tight">{val}</span>
                    <span className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest">{row.formateurEtablissement || "—"}</span>
                      </div>
                    ),
                  },
              {
                    header: "Destination",
                    key: "villeSouhaitee",
                    render: (val, row) => (
                      <div className="flex flex-col">
                    <span className="text-sm font-black text-jb-text-primary uppercase tracking-tight">{val}</span>
                    <span className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest">{row.regionSouhaitee}</span>
                      </div>
                    ),
                  },
              {
                    header: "Établissement",
                    key: "etablissementSouhaite",
                    render: (val) => (
                      <div className="flex items-center gap-2">
                    <MapPinIcon className="w-3.5 h-3.5 text-jb-text-muted" />
                    <span className="text-xs font-bold text-jb-text-secondary">{val}</span>
                      </div>
                    ),
                  },
              {
                    header: "Date",
                    key: "dateDemande",
                    render: (val) => (
                      <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-jb-text-muted" />
                    <span className="text-xs font-bold text-jb-text-secondary">{val}</span>
                      </div>
                    ),
                  },
              {
                    header: "Statut",
                    key: "etat",
                    render: (val) => (
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-jb-bg-section text-jb-text-secondary border-jb-border">
                    {val === "VALIDE" ? "Validée" : val === "REFUSE" ? "Refusée" : "En attente"}
                  </span>
                    ),
              },
              {
                header: "Actions",
                key: "actions",
                render: (_, row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(row)}
                    className="hover:bg-primary-50 text-primary-600 font-black"
                    aria-label="Voir les détails de la permutation"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
          />

          {demandes.length === 0 && !loading && (
            <div className="p-20 text-center bg-jb-bg-section/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-jb-border shadow-sm">
                <InboxIcon className="w-10 h-10 text-jb-text-muted" />
              </div>
              <h3 className="text-lg font-black text-jb-text-primary uppercase tracking-tight">Aucune permutation</h3>
              <p className="text-sm font-medium text-jb-text-muted mt-2">
                Aucune permutation ne correspond aux filtres actuels.
              </p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          title={selectedDemande ? `Détails de la permutation #${selectedDemande.id}` : ""}
          size="xl"
        >
              {selectedDemande && (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
              <DetailDemande demande={selectedDemande} />
              {selectedDemande.etat === 'EN_ATTENTE' && (
                <div className="bg-jb-bg-section rounded-lg border border-white/70 p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-jb-text-primary">Décision de la commission</h3>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Commentaire optionnel..."
                    className="w-full min-h-[120px] rounded-lg border border-jb-border bg-white p-4 text-sm font-medium text-jb-text-primary outline-none focus:border-jb-magenta"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleReview('VALIDE')}
                      loading={reviewLoading}
                      icon={CheckCircleIcon}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReview('REFUSE')}
                      loading={reviewLoading}
                      icon={XCircleIcon}
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default DemandesManagement;
