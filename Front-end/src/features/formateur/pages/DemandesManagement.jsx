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
import {
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

/**
 * Page de gestion des demandes pour les formateurs
 *
 * Fonctionnalités :
 * - Liste des demandes personnelles
 * - Vue détaillée de chaque demande
 * - Statistiques personnelles
 * - Navigation intuitive
 */
const DemandesManagement = () => {
  const dispatch = useDispatch();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const { role: userRole, user: currentUser } = useAuth();
  const allDemandes = useSelector((state) => state.formateur.demandes.data);
  const loading = useSelector((state) => state.formateur.demandes.loading);
  const error = useSelector((state) => state.formateur.demandes.error);

  // Filtrer pour n'afficher que les demandes de l'utilisateur courant
  const demandes =
    userRole === "formateur"
      ? allDemandes.filter((d) => d.utilisateurId === currentUser?.id)
      : allDemandes;

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
        demande.dateDebut?.toLowerCase().includes(searchToUse) ||
        demande.dateFin?.toLowerCase().includes(searchToUse)
      );
    });
  }, [demandes, searchTerm, globalSearchTerm]);

  useEffect(() => {
    dispatch(fetchDemandes());
  }, [dispatch]);

  /**
   * Affiche le détail d'une demande dans une modal
   */
  const handleViewDetail = (demande) => {
    setSelectedDemande(demande);
    setShowDetailModal(true);
  };

  /**
   * Ferme la modal de détail
   */
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedDemande(null);
  };

  /**
   * Retourne le badge de statut avec style approprié
   */
  const getStatusBadge = (etat) => {
    const baseClasses = "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border";

    switch (etat) {
      case "EN_ATTENTE":
        return (
          <span
            className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200`}
          >
            En attente
          </span>
        );
      case "VALIDE":
        return (
          <span
            className={`${baseClasses} bg-primary-50 text-primary-700 border-primary-200`}
          >
            Validée
          </span>
        );
      case "REFUSE":
        return (
          <span
            className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}
          >
            Refusée
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-secondary-50 text-secondary-700 border-secondary-200`}
          >
            Inconnu
          </span>
        );
    }
  };

  // Calcul des statistiques
  const stats = {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.etat === "EN_ATTENTE").length,
    validees: demandes.filter((d) => d.etat === "VALIDE").length,
    refusees: demandes.filter((d) => d.etat === "REFUSE").length,
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
        {/* En-tête */}
        <div>
          <h1 className="text-4xl font-black text-surface-800 tracking-tight">
            Mes Demandes de Permutation
          </h1>
          <p className="text-secondary-700 mt-2 font-medium italic">
            Suivez l'état de vos demandes de permutation professionnelle.
          </p>
          <div className="h-1.5 w-24 bg-primary-500 rounded-full mt-4"></div>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            <p className="text-secondary-600 font-bold uppercase tracking-widest text-xs">Chargement de vos demandes...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center space-x-4">
            <XCircleIcon className="w-8 h-8 shrink-0" />
            <p className="font-bold uppercase tracking-widest text-sm">Erreur: {error}</p>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && (
          <div className="space-y-10">
            {/* Statistiques personnelles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total" 
                value={stats.total} 
                icon={<CalendarIcon className="w-6 h-6" />}
                color="blue"
              />
              <StatCard 
                title="En attente" 
                value={stats.enAttente} 
                icon={<ClockIcon className="w-6 h-6" />}
                color="amber"
              />
              <StatCard 
                title="Validées" 
                value={stats.validees} 
                icon={<CheckCircleIcon className="w-6 h-6" />}
                color="green"
              />
              <StatCard 
                title="Refusées" 
                value={stats.refusees} 
                icon={<XCircleIcon className="w-6 h-6" />}
                color="red"
              />
            </div>

            {/* Liste des demandes */}
            {demandes.length > 0 ? (
              <Card variant="institutional" className="p-8 border-secondary-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <h2 className="text-xl font-black text-surface-800 uppercase tracking-widest border-b-2 border-primary-500 pb-2">
                    Historique de mes demandes
                  </h2>
                  <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-secondary-200 bg-secondary-50/50 py-3 pl-12 pr-12 text-surface-800 placeholder:text-secondary-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold transition-all text-sm"
                      placeholder="Rechercher une demande..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-primary-600 transition-colors"
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
                      header: "Destination",
                      key: "regionSouhaitee",
                      render: (value, row) => (
                        <div className="space-y-1">
                          <div className="font-black text-surface-800">{row.etablissementSouhaite}</div>
                          <div className="text-[10px] font-black text-secondary-400 uppercase tracking-widest flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {row.villeSouhaitee}, {value}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Motif",
                      key: "motif",
                      render: (value, row) => (
                        <div className="space-y-3">
                          <div className="max-w-xs truncate text-secondary-700 font-medium italic text-sm" title={value}>
                            "{value}"
                          </div>
                          {row.documentJoint && (
                            <a 
                              href={`${import.meta.env.VITE_API_URL}/storage/${row.documentJoint}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center text-[9px] font-black text-primary-600 hover:text-white hover:bg-primary-600 uppercase tracking-widest bg-primary-50 border border-primary-100 px-3 py-1 rounded-lg transition-all"
                            >
                              <PaperClipIcon className="h-3 w-3 mr-1" />
                              Justificatif
                            </a>
                          )}
                        </div>
                      ),
                    },
                    {
                      header: "Date Demande",
                      key: "dateDemande",
                      render: (value) => (
                        <div className="flex items-center text-surface-800 font-bold text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-secondary-400" />
                          {value}
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
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewDetail(row)}
                          className="flex items-center px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      ),
                    },
                  ]}
                />
                
                {filteredDemandes.length === 0 && (
                  <div className="py-20 text-center bg-secondary-50/30 rounded-2xl border-2 border-dashed border-secondary-100 mt-6">
                    <MagnifyingGlassIcon className="w-16 h-16 text-secondary-200 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-surface-800 mb-2 uppercase tracking-tight">
                      Aucun résultat pour "{searchTerm}"
                    </h3>
                    <p className="text-secondary-400 font-medium italic">
                      Essayez d'ajuster vos critères de recherche ou de réinitialiser le filtre.
                    </p>
                  </div>
                )}
              </Card>
            ) : (
              /* Message quand aucune demande */
              <Card variant="institutional" className="p-20 text-center border-secondary-100">
                <div className="p-6 bg-secondary-50 rounded-full inline-block mb-8">
                  <CalendarIcon className="w-20 h-20 text-secondary-300 mx-auto" />
                </div>
                <h3 className="text-2xl font-black text-surface-800 mb-4 uppercase tracking-tight">
                  Aucune demande encore soumise
                </h3>
                <p className="text-secondary-600 mb-10 font-medium italic max-w-md mx-auto">
                  Vous n'avez pas encore soumis de demande de permutation professionnelle sur cette plateforme.
                </p>
                <Button
                  variant="primary"
                  className="px-12 py-5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20"
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

        {/* Modal de détail de la demande */}
        <Modal
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          title={
            selectedDemande
              ? `Détails de la demande #${selectedDemande.id}`
              : ""
          }
          size="xl"
        >
          {selectedDemande && (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar p-2">
              <DetailDemande demande={selectedDemande} />
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-white text-secondary-600 border-secondary-100 hover:border-secondary-300',
    green: 'bg-white text-primary-600 border-primary-100 hover:border-primary-300',
    amber: 'bg-white text-amber-600 border-amber-100 hover:border-amber-300',
    red: 'bg-white text-red-600 border-red-100 hover:border-red-300',
  };

  const iconColors = {
    blue: 'bg-secondary-50 text-secondary-600',
    green: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card variant="institutional" className={`p-6 border-2 group hover:translate-y-[-4px] transition-all duration-300 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400">{title}</p>
          <h3 className="text-3xl font-black tracking-tight text-surface-800">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl shadow-sm border border-transparent group-hover:scale-110 transition-transform duration-500 ${iconColors[color] || iconColors.blue}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default DemandesManagement;
