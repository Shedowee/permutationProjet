import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import Button from "../../../shared/components/Button";
import TraitementDemandeModal from "../components/TraitementDemandeModal";
import { fetchDemandes, traiterDemande } from "../redux/commissionSlice";
import { useAuth } from "../../../auth/hooks/useAuth";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const DemandesManagement = () => {
  const dispatch = useDispatch();
  const { role: userRole } = useAuth();
  const demandes = useSelector((state) => state.commission.demandes.data);
  const loading = useSelector((state) => state.commission.demandes.loading);
  const error = useSelector((state) => state.commission.demandes.error);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showTraitementModal, setShowTraitementModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDemandes());
  }, [dispatch]);

  const handleTraiterDemande = (demande) => {
    setSelectedDemande(demande);
    setShowTraitementModal(true);
  };

  const handleTraitementSubmit = async (traitementData) => {
    try {
      await dispatch(traiterDemande(traitementData)).unwrap();
      // Succès - la modal se fermera automatiquement
    } catch (error) {
      console.error("Erreur lors du traitement:", error);
      throw error; // Pour que la modal gère l'erreur
    }
  };

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

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Gestion des Demandes
          </h1>
          <p className="text-gray-400 mt-2">
            {userRole === "commission"
              ? "Traiter les demandes de permutation"
              : "Suivre vos demandes de permutation"}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400">
            Erreur: {error}
          </div>
        )}

        {!loading && !error && demandes && demandes.length > 0 && (
          <div className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <ClockIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">
                      {demandes.filter((d) => d.etat === "EN_ATTENTE").length}
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
                      {demandes.filter((d) => d.etat === "VALIDE").length}
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
                      {demandes.filter((d) => d.etat === "REFUSE").length}
                    </p>
                    <p className="text-sm text-gray-400">Refusées</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <CalendarIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">
                      {demandes.length}
                    </p>
                    <p className="text-sm text-gray-400">Total</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Table des demandes */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Liste des demandes
              </h2>

              <Table
                data={demandes}
                columns={[
                  {
                    header: "Utilisateur",
                    key: "utilisateurNom",
                    render: (value, row) => (
                      <div>
                        <div className="font-medium text-white">{value}</div>
                        <div className="text-sm text-gray-400">
                          {row.utilisateurEmail}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Motif",
                    key: "motif",
                    render: (value) => (
                      <div
                        className="max-w-xs truncate text-gray-300"
                        title={value}
                      >
                        {value}
                      </div>
                    ),
                  },
                  {
                    header: "Période",
                    key: "dateDebut",
                    render: (value, row) => (
                      <div className="text-gray-300">
                        <div>Du {value}</div>
                        <div>Au {row.dateFin}</div>
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
                    render: (value, row) =>
                      userRole === "commission" ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTraiterDemande(row)}
                            disabled={row.etat !== "EN_ATTENTE" || userRole !== "commission"}
                            className="flex items-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Traiter
                          </Button>
                        </div>
                      ) : null,
                  },
                ]}
                caption={`Demandes de permutation (${demandes.length})`}
              />
            </Card>
          </div>
        )}

        {!loading && !error && (!demandes || demandes.length === 0) && (
          <Card className="p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-400">
              Il n'y a actuellement aucune demande de permutation à traiter.
            </p>
          </Card>
        )}

        {/* Modal de traitement améliorée */}
        <TraitementDemandeModal
          isOpen={showTraitementModal}
          onClose={() => {
            setShowTraitementModal(false);
            setSelectedDemande(null);
          }}
          demande={selectedDemande}
          onTraiter={handleTraitementSubmit}
        />
      </div>
    </Layout>
  );
};

export default DemandesManagement;
