import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { createDemande } from "../redux/formateurSlice";
import { useAuth } from "../../../auth/hooks/useAuth";

const CreateDemande = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    motif: "",
    dateDebut: "",
    dateFin: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.motif.trim()) {
      setError("Veuillez saisir un motif pour la demande");
      return;
    }

    if (!formData.dateDebut || !formData.dateFin) {
      setError("Veuillez sélectionner les dates de début et de fin");
      return;
    }

    const startDate = new Date(formData.dateDebut);
    const endDate = new Date(formData.dateFin);

    if (startDate >= endDate) {
      setError("La date de fin doit être postérieure à la date de début");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await dispatch(
        createDemande({
          utilisateurId: currentUser?.id,
          utilisateurNom: currentUser?.name,
          utilisateurEmail: currentUser?.email,
          motif: formData.motif,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
        })
      ).unwrap();

      setSuccess(true);
      setFormData({
        motif: "",
        dateDebut: "",
        dateFin: "",
      });

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      if (err && err.status === 403) {
        setError("Vous n'êtes pas autorisé à créer de demandes.");
      } else {
        setError((err && err.message) || "Erreur lors de la création de la demande");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Créer une Demande de Permutation
          </h1>
          <p className="text-gray-400 mt-2">
            Remplissez le formulaire pour soumettre une demande de permutation
          </p>
        </div>

        <Card className="p-6 max-w-2xl mx-auto">
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="text-green-400 font-medium">
                Demande créée avec succès !
              </div>
              <p className="text-green-300 text-sm mt-1">
                Votre demande a été soumise et est en attente de validation.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-medium">Erreur</div>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Motif de la demande *
              </label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Décrivez le motif de votre demande de permutation..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date de fin *
                </label>
                <input
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>* Champs obligatoires</p>
              <p className="mt-1">
                Les dates doivent être comprises entre aujourd'hui et 6 mois à
                venir.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Envoi en cours...
                  </div>
                ) : (
                  "Soumettre la demande"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateDemande;
