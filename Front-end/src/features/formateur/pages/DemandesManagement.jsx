import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import Button from "../../../shared/components/Button";
import DetailDemande from "../components/DetailDemande";
import Modal from "../../../shared/components/Modal";
import { fetchDemandes } from "../redux/formateurSlice";
import { useAuth } from "../../../auth/hooks/useAuth";
import { selectSearchTerm } from "../../../shared/redux/searchSlice";
import { motion } from "framer-motion";
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperClipIcon,
  MapPinIcon,
  InboxIcon,
  FunnelIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const DemandesManagement = () => {
  const dispatch = useDispatch();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const { role: userRole, user: currentUser } = useAuth();
  const allDemandes = useSelector((state) => state.formateur.demandes.data);
  const loading = useSelector((state) => state.formateur.demandes.loading);
  const error = useSelector((state) => state.formateur.demandes.error);

  const demandes = useMemo(() => {
    if (!allDemandes) return [];
    return userRole === "formateur"
      ? allDemandes.filter((d) => d.utilisateurId === currentUser?.id)
      : allDemandes;
  }, [allDemandes, userRole, currentUser]);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDemandes = useMemo(() => {
    if (!demandes) return [];
    return demandes.filter((demande) => {
      const searchToUse = (searchTerm || globalSearchTerm || "").toLowerCase();
      return (
        demande.motif?.toLowerCase().includes(searchToUse) ||
        demande.etat?.toLowerCase().includes(searchToUse) ||
        demande.etablissementSouhaite?.toLowerCase().includes(searchToUse) ||
        demande.villeSouhaitee?.toLowerCase().includes(searchToUse)
      );
    });
  }, [demandes, searchTerm, globalSearchTerm]);

  useEffect(() => {
    dispatch(fetchDemandes());
  }, [dispatch]);

  const handleViewDetail = (demande) => {
    setSelectedDemande(demande);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedDemande(null);
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
          <span className={`${baseClasses} bg-surface-50 text-surface-700 border-surface-200`}>
            Inconnu
          </span>
        );
    }
  };

  const stats = useMemo(() => ({
    total: demandes.length,
    enAttente: demandes.filter((d) => d.etat === "EN_ATTENTE").length,
    validees: demandes.filter((d) => d.etat === "VALIDE").length,
    refusees: demandes.filter((d) => d.etat === "REFUSE").length,
  }), [demandes]);

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase">
              Mes Demandes
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 bg-primary-500 rounded-full"></span>
              <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">
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
                const path = userRole === 'employe' ? '/employe/demandes/create' : '/formateur/demandes/create';
                window.location.href = path;
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
            className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 text-red-700"
          >
            <XCircleIcon className="h-6 w-6 shrink-0" />
            <p className="text-sm font-bold uppercase tracking-widest">Erreur: {error}</p>
          </motion.div>
        )}

        {loading && !allDemandes ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
            <p className="text-xs font-black text-surface-400 uppercase tracking-widest">Chargement de vos dossiers...</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatItem label="En Attente" value={stats.enAttente} icon={ClockIcon} color="accent" />
              <StatItem label="Validées" value={stats.validees} icon={CheckCircleIcon} color="success" />
              <StatItem label="Refusées" value={stats.refusees} icon={XCircleIcon} color="danger" />
              <StatItem label="Total" value={stats.total} icon={InboxIcon} color="primary" />
            </div>

            {demandes.length > 0 ? (
              <Card className="p-0 overflow-hidden">
                <div className="p-8 border-b border-surface-50 bg-surface-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-500 text-white rounded-xl shadow-primary">
                      <FunnelIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xs font-black text-surface-900 uppercase tracking-widest">
                      Historique des demandes
                    </h2>
                  </div>
                  
                  <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-surface-400 group-focus-within:text-primary-500 transition-standard" />
                    </div>
                    <input
                      type="text"
                      className="input-field pl-12 pr-12"
                      placeholder="Rechercher une destination, un motif..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <Table
                  data={filteredDemandes}
                  columns={[
                    {
                      header: "Destination Souhaitée",
                      key: "etablissementSouhaite",
                      render: (value, row) => (
                        <div>
                          <div className="font-black text-surface-900">{value}</div>
                          <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            <MapPinIcon className="h-3 w-3" />
                            {row.villeSouhaitee}, {row.regionSouhaitee}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Motif & Justificatif",
                      key: "motif",
                      render: (value, row) => (
                        <div className="flex flex-col gap-2">
                          <div className="max-w-xs truncate text-surface-600 font-medium italic" title={value}>
                            "{value}"
                          </div>
                          {row.documentJoint && (
                            <a 
                              href={`${import.meta.env.VITE_API_URL}/storage/${row.documentJoint}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg transition-standard w-fit"
                            >
                              <PaperClipIcon className="h-3.5 w-3.5" />
                              Voir le justificatif
                            </a>
                          )}
                        </div>
                      ),
                    },
                    {
                      header: "Date de création",
                      key: "dateDemande",
                      render: (value) => (
                        <div className="flex items-center gap-2 text-surface-500 font-bold">
                          <CalendarIcon className="w-4 h-4 text-surface-300" />
                          <span className="text-xs">{value}</span>
                        </div>
                      ),
                    },
                    {
                      header: "Statut",
                      key: "etat",
                      render: (value) => getStatusBadge(value),
                    },
                    {
                      header: "Actions",
                      key: "actions",
                      render: (value, row) => (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleViewDetail(row)}
                          icon={EyeIcon}
                        >
                          Détails
                        </Button>
                      ),
                    },
                  ]}
                />

                {filteredDemandes.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <InboxIcon className="w-10 h-10 text-surface-200" />
                    </div>
                    <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest mb-2">
                      Aucun résultat pour "{searchTerm}"
                    </h3>
                    <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">
                      Essayez d'ajuster vos critères de recherche.
                    </p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-20 text-center">
                <div className="w-24 h-24 bg-surface-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <InboxIcon className="w-12 h-12 text-surface-200" />
                </div>
                <h3 className="text-2xl font-black text-surface-900 uppercase tracking-tight mb-4">
                  Aucune demande soumise
                </h3>
                <p className="text-surface-500 font-bold italic max-w-md mx-auto mb-10 leading-relaxed">
                  Vous n'avez pas encore formulé de demande de permutation. Cliquez sur le bouton ci-dessous pour commencer.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  icon={PlusIcon}
                  onClick={() => {
                    const path = userRole === 'employe' ? '/employe/demandes/create' : '/formateur/demandes/create';
                    window.location.href = path;
                  }}
                >
                  Créer ma première demande
                </Button>
              </Card>
            )}
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
    primary: 'border-primary-100 bg-primary-50/10 text-primary-600',
    success: 'border-green-100 bg-green-50/10 text-green-600',
    accent: 'border-amber-100 bg-amber-50/10 text-amber-600',
    danger: 'border-red-100 bg-red-50/10 text-red-600',
  };

  const iconStyles = {
    primary: 'bg-primary-500 text-white shadow-primary',
    success: 'bg-green-500 text-white shadow-soft',
    accent: 'bg-amber-500 text-white shadow-soft',
    danger: 'bg-red-500 text-white shadow-soft',
  };

  return (
    <Card className={`p-6 border-2 transition-standard ${colorStyles[color] || colorStyles.primary}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">{label}</p>
          <h3 className="text-3xl font-black tracking-tight text-surface-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl transition-standard group-hover:scale-110 ${iconStyles[color] || iconStyles.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

export default DemandesManagement;
