import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { CheckCircleIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

/**
 * Modal pour traiter une demande de permutation
 * 
 * Cette composante permet à la commission de :
 * - Valider ou refuser une demande
 * - Ajouter un commentaire de décision
 * - Voir les détails de la demande
 */
const TraitementDemandeModal = ({ isOpen, onClose, demande, onTraiter }) => {
  const [decision, setDecision] = useState(''); // 'VALIDE' ou 'REFUSE'
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Réinitialiser les champs quand la modal s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      setDecision('');
      setCommentaire('');
      setError('');
    }
  }, [isOpen]);

  /**
   * Gère la soumission du traitement
   */
  const handleSubmit = async () => {
    // Validation
    if (!decision) {
      setError('Veuillez sélectionner une décision (valider ou refuser)');
      return;
    }

    if (!commentaire.trim()) {
      setError('Veuillez ajouter un commentaire expliquant votre décision');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onTraiter({
        id: demande.id,
        etat: decision,
        commentaire: commentaire.trim()
      });
      
      // Fermer la modal après succès
      onClose();
    } catch (err) {
      setError('Erreur lors du traitement de la demande');
      console.error('Erreur traitement:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Annule le traitement et ferme la modal
   */
  const handleCancel = () => {
    setDecision('');
    setCommentaire('');
    setError('');
    onClose();
  };

  if (!demande) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title={`Traiter la demande #${demande.id}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Informations de la demande */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-3">Détails de la demande</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Demandeur:</span>
              <p className="text-white font-medium">{demande.utilisateurNom}</p>
              <p className="text-gray-300">{demande.utilisateurEmail}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Dates demandées:</span>
              <p className="text-white font-medium">
                Du {demande.dateDebut} au {demande.dateFin}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <span className="text-gray-400">Motif:</span>
              <p className="text-white">{demande.motif}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Date de demande:</span>
              <p className="text-white">{demande.dateDemande}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Statut actuel:</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                demande.etat === 'EN_ATTENTE' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                demande.etat === 'VALIDE' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {demande.etat === 'EN_ATTENTE' ? 'En attente' :
                 demande.etat === 'VALIDE' ? 'Validée' : 'Refusée'}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire de décision */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-400" />
            Votre décision
          </h3>
          
          {/* Choix de décision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setDecision('VALIDE')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                decision === 'VALIDE' 
                  ? 'border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/20' 
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-green-500/50 hover:bg-green-500/10'
              }`}
            >
              <div className="flex flex-col items-center">
                <CheckCircleIcon className="w-8 h-8 mb-2" />
                <span className="font-medium">Valider</span>
                <span className="text-xs opacity-80">Approuver la demande</span>
              </div>
            </button>
            
            <button
              onClick={() => setDecision('REFUSE')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                decision === 'REFUSE' 
                  ? 'border-red-500 bg-red-500/20 text-red-300 shadow-lg shadow-red-500/20' 
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-red-500/50 hover:bg-red-500/10'
              }`}
            >
              <div className="flex flex-col items-center">
                <XCircleIcon className="w-8 h-8 mb-2" />
                <span className="font-medium">Refuser</span>
                <span className="text-xs opacity-80">Rejeter la demande</span>
              </div>
            </button>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Commentaire de décision *
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => {
                setCommentaire(e.target.value);
                if (error) setError('');
              }}
              rows="4"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={
                decision === 'VALIDE' 
                  ? 'Expliquez pourquoi vous validez cette demande...' 
                  : decision === 'REFUSE' 
                    ? 'Expliquez en détail les raisons du refus...' 
                    : 'Votre commentaire...'
              }
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce commentaire sera visible par le formateur
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
          <Button 
            variant="secondary" 
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || !decision || !commentaire.trim()}
            className="flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Confirmer la décision
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TraitementDemandeModal;