import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import Button from "../../../shared/components/Button";
import DetailDemande from "../components/DetailDemande";
import Modal from "../../../shared/components/Modal";
import { fetchDemandes } from "../redux/formateurSlice";
import { getDemande, deleteDemande } from "../../../services/demandesService";
import { selectSearchTerm } from "../../../shared/redux/searchSlice";
import { useAuth } from "../../../auth/hooks/useAuth";
import { motion } from "framer-motion";
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  InboxIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../../shared/context/useToast";

const DemandesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const { user, role } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const allDemandes = useSelector((state) => state.formateur.demandes.data);
  const meta = useSelector((state) => state.formateur.demandes.meta);
  const loading = useSelector((state) => state.formateur.demandes.loading);
  const error = useSelector((state) => state.formateur.demandes.error);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const accountStatus = String(user?.status || "").toLowerCase();
  const canAccessDemandes = role === "formateur" && ["active", "actif"].includes(accountStatus);

  useEffect(() => {
    if (!canAccessDemandes) {
      return;
    }

    dispatch(fetchDemandes({
      page: currentPage,
      limit: pageSize,
      filters: {
        search: searchTerm || globalSearchTerm,
        etat: status || undefined,
        scope: 'mine',
      }
    }));
  }, [dispatch, currentPage, searchTerm, globalSearchTerm, status, canAccessDemandes]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, globalSearchTerm, status]);

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
              message: "Cette demande a été supprimée ou n'est plus disponible.",
              returnTo: "/formateur/demandes",
              returnLabel: "Retour aux demandes",
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

  const paginatedDemandes = useMemo(() => {
    const demandes = allDemandes || [];
    if (!status) {
      return demandes;
    }
    return demandes.filter((demande) => (demande.etat || "").toUpperCase() === status);
  }, [allDemandes, status]);

  const handleViewDetail = (demande) => {
    setSelectedDemande(demande);
    setShowDetailModal(true);
  };

  const handleEditDemande = (demande) => {
    navigate(`/formateur/demandes/create?edit=${demande.id}`);
  };

  const handleDeleteDemande = async (demande) => {
    const confirmed = window.confirm("Supprimer cette demande en attente ?");
    if (!confirmed) return;

    try {
      await deleteDemande(demande.id);
      toastSuccess("Demande supprimée avec succès");
      if (selectedDemande?.id === demande.id) {
        handleCloseDetail();
      }
      dispatch(fetchDemandes({
        page: currentPage,
        limit: pageSize,
        filters: {
          search: searchTerm || globalSearchTerm,
          etat: status || undefined,
          scope: 'mine',
        }
      }));
    } catch (err) {
      toastError(err?.response?.data?.message || "Impossible de supprimer la demande");
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedDemande(null);
    const params = new URLSearchParams(location.search);
    params.delete("demande");
    const query = params.toString();
    navigate(query ? `/formateur/demandes?${query}` : "/formateur/demandes", { replace: true });
  };

  const getStatusBadge = (etat) => {
    const baseClasses = "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border";

    switch (etat) {
      case "EN_ATTENTE":
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200`}>
            En attente
          </span>
        );
      case "VALIDE":
        return (
          <span className={`${baseClasses} bg-primary-50 text-primary-700 border-primary-200`}>
            Validée
          </span>
        );
      case "REFUSE":
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>
            Refusée
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-jb-bg-section text-jb-text-secondary border-jb-border`}>
            Inconnu
          </span>
        );
    }
  };

  const stats = useMemo(() => ({
    total: meta?.total || 0,
    enAttente: paginatedDemandes.filter((d) => d.etat === "EN_ATTENTE").length,
    validees: paginatedDemandes.filter((d) => d.etat === "VALIDE").length,
    refusees: paginatedDemandes.filter((d) => d.etat === "REFUSE").length,
  }), [paginatedDemandes, meta]);

  if (!canAccessDemandes) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
          <h1 className="text-3xl font-black text-jb-text-primary uppercase tracking-tight">Accès limité</h1>
          <p className="text-jb-text-muted font-medium">
            Votre compte n'a pas encore accès aux demandes de permutation. Vérifiez votre email puis attendez la validation administrative.
          </p>
          <Button variant="primary" onClick={() => navigate("/profile")}>
            Aller au profil
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-jb-text-primary tracking-tight uppercase">
              Mes Demandes
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 rounded-full" style={{ background: 'var(--jb-gradient-primary)' }}></span>
              <p className="text-jb-text-muted font-black uppercase tracking-widest text-[10px]">
                Historique et suivi de vos dossiers de permutation
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
              <Button
                variant="primary"
                size="lg"
                icon={PlusIcon}
                onClick={() => {
                  window.location.href = '/formateur/demandes/create';
                }}
              >
                Nouvelle Demande
              </Button>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/15 bg-red-500/5 p-6 flex items-start gap-4 text-red-700"
          >
            <XCircleIcon className="h-6 w-6 shrink-0" />
            <p className="text-sm font-bold uppercase tracking-widest">Erreur: {error}</p>
          </motion.div>
        )}

        {loading && !allDemandes ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-jb-bg-elevated border-t-jb-magenta animate-spin"></div>
            <p className="text-xs font-black text-jb-text-muted uppercase tracking-widest">Chargement de vos dossiers...</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatItem label="En Attente" value={stats.enAttente} icon={ClockIcon} color="accent" />
              <StatItem label="Validées" value={stats.validees} icon={CheckCircleIcon} color="success" />
              <StatItem label="Refusées" value={stats.refusees} icon={XCircleIcon} color="danger" />
              <StatItem label="Total" value={stats.total} icon={InboxIcon} color="primary" />
            </div>

            <Card noPadding className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-lg overflow-hidden shadow-[0_32px_76px_-44px_rgba(15,31,24,0.4)]">
              <div className="p-8 border-b border-white/70 bg-jb-bg-section/70 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl shadow-primary" style={{ background: 'var(--jb-gradient-primary)' }}>
                    <InboxIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-jb-text-primary uppercase tracking-widest">
                      Mes Demandes
                    </h2>
                    <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest mt-0.5">
                      Historique des permutations
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group min-w-[300px]">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-jb-text-muted group-focus-within:text-jb-magenta transition-colors" />
                    <input
                      type="text"
                      placeholder="Rechercher une demande..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-jb-border rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-jb-text-primary focus:border-jb-magenta outline-none transition-all placeholder:text-jb-text-muted"
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

                </div>
              </div>

              <Table
                data={paginatedDemandes}
                loading={loading}
                pagination={{
                  currentPage,
                  totalPages: meta?.last_page || 1,
                  totalItems: meta?.total || 0,
                  onPageChange: setCurrentPage,
                  pageSize
                }}
                columns={[
                  {
                    header: "Destination",
                    key: "villeSouhaitee",
                    render: (val, row) => (
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-jb-text-primary uppercase tracking-tight">{val}</span>
                        <span className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest">{row.regionSouhaitee}</span>
                      </div>
                    )
                  },
                  {
                    header: "Établissement",
                    key: "etablissementSouhaite",
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-3.5 h-3.5 text-jb-text-muted" />
                        <span className="text-xs font-bold text-jb-text-secondary">{val}</span>
                      </div>
                    )
                  },
                  {
                    header: "Date Soumission",
                    key: "dateDemande",
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-jb-text-muted" />
                        <span className="text-xs font-bold text-jb-text-secondary">{val}</span>
                      </div>
                    )
                  },
                  {
                    header: "Statut",
                    key: "etat",
                    render: (val) => getStatusBadge(val)
                  },
                  {
                    header: "Actions",
                    key: "actions",
                    render: (_, row) => (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(row)}
                          className="hover:bg-primary-50 text-primary-600 font-black"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                        {row.etat === "EN_ATTENTE" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDemande(row)}
                              className="hover:bg-amber-50 text-amber-600 font-black"
                            >
                              <PencilIcon className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDemande(row)}
                              className="hover:bg-red-50 text-red-600 font-black"
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Supprimer
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  }
                ]}
              />

          {paginatedDemandes.length === 0 && !loading && (
                <div className="p-20 text-center bg-jb-bg-section/50">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-jb-border shadow-sm">
                    <InboxIcon className="w-10 h-10 text-jb-text-muted" />
                  </div>
                  <h3 className="text-lg font-black text-jb-text-primary uppercase tracking-tight">Aucune demande</h3>
                  <p className="text-sm font-medium text-jb-text-muted mt-2">
                    Vous n'avez pas encore formulé de demande de permutation.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        <Modal
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          title={selectedDemande ? `Détails de la demande #${selectedDemande.id}` : ""}
          size="xl"
        >
          {selectedDemande && (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              <DetailDemande demande={selectedDemande} />
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

const StatItem = ({ label, value, icon: Icon, color }) => {
  const colorStyles = {
    primary: 'border-jb-magenta/20 bg-jb-magenta/5 text-jb-magenta',
    success: 'border-jb-green/20 bg-jb-green/5 text-jb-green',
    accent: 'border-jb-orange/20 bg-jb-orange/5 text-jb-orange',
    danger: 'border-jb-red/20 bg-jb-red/5 text-jb-red',
  };

  const iconStyles = {
    primary: 'bg-jb-magenta text-white shadow-primary',
    success: 'bg-jb-green text-white shadow-soft',
    accent: 'bg-jb-orange text-white shadow-soft',
    danger: 'bg-jb-red text-white shadow-soft',
  };

  return (
    <Card className={`p-6 border transition-standard ${colorStyles[color] || colorStyles.primary}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">{label}</p>
          <h3 className="text-3xl font-black tracking-tight text-jb-text-primary">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl transition-standard group-hover:scale-110 ${iconStyles[color] || iconStyles.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

export default DemandesManagement;
