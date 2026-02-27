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
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (etat) {
      case "EN_ATTENTE":
        return (
          <span
            className={`${baseClasses} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`}
          >
            En attente
          </span>
        );
      case "VALIDE":
        return (
          <span
            className={`${baseClasses} bg-green-500/20 text-green-300 border border-green-500/30`}
          >
            Validée
          </span>
        );
      case "REFUSE":
        return (
          <span
            className={`${baseClasses} bg-red-500/20 text-red-300 border border-red-500/30`}
          >
            Refusée
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-500/20 text-gray-300 border border-gray-500/30`}
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
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Mes Demandes de Permutation
          </h1>
          <p className="text-gray-400 mt-2">
            Suivez l'état de vos demandes de permutation
          </p>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400">
            Erreur: {error}
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Statistiques personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">
                      {stats.total}
                    </p>
                    <p className="text-sm text-gray-400">Total</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <ClockIcon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">
                      {stats.enAttente}
                    </p>
                    <p className="text-sm text-gray-400">En attente</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">
                      {stats.validees}
                    </p>
                    <p className="text-sm text-gray-400">Validées</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">
                      {stats.refusees}
                    </p>
                    <p className="text-sm text-gray-400">Refusées</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Liste des demandes */}
            {demandes.length > 0 ? (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Historique de mes demandes
                  </h2>
                  <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-lg border-0 bg-white/5 py-2 pl-10 pr-10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
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
                        <div className="text-gray-300">
                          <div className="font-bold text-white">{row.etablissementSouhaite}</div>
                          <div className="text-[10px] uppercase tracking-widest">{row.villeSouhaitee}, {value}</div>
                        </div>
                      ),
                    },
                    {
                      header: "Motif",
                      key: "motif",
                      render: (value, row) => (
                        <div className="space-y-2">
                          <div className="max-w-xs truncate text-gray-300" title={value}>
                            {value}
                          </div>
                          {row.documentJoint && (
                            <a 
                              href={`${import.meta.env.VITE_API_URL}/storage/${row.documentJoint}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg transition-colors"
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
                        <span className="text-gray-300">{value}</span>
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
                          className="flex items-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Voir détails
                        </Button>
                      ),
                    },
                  ]}
                  caption={`Vos demandes de permutation (${filteredDemandes.length})`}
                />
                
                {filteredDemandes.length === 0 && (
                  <div className="py-12 text-center">
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Aucun résultat pour "{searchTerm}"
                    </h3>
                    <p className="text-gray-400">
                      Essayez d'ajuster vos critères de recherche.
                    </p>
                  </div>
                )}
              </Card>
            ) : (
              /* Message quand aucune demande */
              <Card className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  Aucune demande encore soumise
                </h3>
                <p className="text-gray-400 mb-6">
                  Vous n'avez pas encore soumis de demande de permutation.
                </p>
                <Button
                  variant="primary"
                  onClick={() =>
                    (window.location.href = "/formateur/demandes/create")
                  }
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
            <div className="max-h-[70vh] overflow-y-auto">
              <DetailDemande demande={selectedDemande} />
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default DemandesManagement;
