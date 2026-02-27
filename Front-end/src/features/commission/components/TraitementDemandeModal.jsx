import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

/**
 * Modal pour traiter une demande de permutation
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

  const handleSubmit = async () => {
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
      onClose();
    } catch (err) {
      const message =
        (err && err.status === 403)
          ? "Vous n'êtes pas autorisé à traiter cette demande."
          : (err && err.message) || 'Erreur lors du traitement de la demande';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!demande) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Dossier de Permutation #${demande.id}`}
      size="xl"
    >
      <div className="space-y-8">
        {/* Informations de la demande */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-surface-50 rounded-[2rem] p-6 border border-surface-100">
              <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Informations du Demandeur
              </h3>
              <div className="space-y-1">
                <p className="text-surface-900 font-bold text-lg">{demande.utilisateurNom}</p>
                <p className="text-surface-500 text-sm font-medium">{demande.utilisateurEmail}</p>
              </div>
            </div>

            <div className="bg-primary-50/50 rounded-[2rem] p-6 border border-primary-100">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                Destination Souhaitée
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-surface-900 font-bold">{demande.etablissementSouhaite}</p>
                    <p className="text-surface-500 text-xs font-medium uppercase tracking-widest mt-1">
                      {demande.villeSouhaitee}, {demande.regionSouhaitee}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-50 rounded-[2rem] p-6 border border-surface-100 h-full flex flex-col">
              <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Motif & Justificatif
              </h3>
              <p className="text-surface-700 italic text-sm leading-relaxed mb-6 flex-1">
                "{demande.motif}"
              </p>
              {demande.documentJoint && (
                <a 
                  href={`${import.meta.env.VITE_API_URL}/storage/${demande.documentJoint}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-surface-200 hover:border-primary-300 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-50 rounded-xl text-primary-600 group-hover:scale-110 transition-transform">
                      <PaperClipIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-surface-900 uppercase tracking-widest">Voir la pièce jointe</span>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-teal-500" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire de décision */}
        <div className="pt-8 border-t border-surface-100 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-surface-900 uppercase tracking-[0.2em] flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-primary-600" />
              Décision de la Commission
            </h3>
            <div className="flex items-center space-x-2 text-[10px] font-black text-surface-400 uppercase tracking-widest">
              <CalendarIcon className="h-4 w-4" />
              <span>Soumis le {demande.dateDemande}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setDecision('VALIDE')}
              className={`p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center text-center space-y-3 ${
                decision === 'VALIDE' 
                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-xl shadow-teal-500/10' 
                  : 'border-surface-100 bg-surface-50 text-surface-400 hover:border-teal-200 hover:bg-teal-50/30'
              }`}
            >
              <div className={`p-4 rounded-2xl transition-all duration-500 ${decision === 'VALIDE' ? 'bg-teal-500 text-white shadow-lg' : 'bg-white text-surface-200 shadow-sm'}`}>
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-xs">Approuver</p>
                <p className="text-[10px] font-medium mt-1 opacity-70">Valider la permutation</p>
              </div>
            </button>
            
            <button
              onClick={() => setDecision('REFUSE')}
              className={`p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center text-center space-y-3 ${
                decision === 'REFUSE' 
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-xl shadow-red-500/10' 
                  : 'border-surface-100 bg-surface-50 text-surface-400 hover:border-red-200 hover:bg-red-50/30'
              }`}
            >
              <div className={`p-4 rounded-2xl transition-all duration-500 ${decision === 'REFUSE' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-surface-200 shadow-sm'}`}>
                <XCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-xs">Rejeter</p>
                <p className="text-[10px] font-medium mt-1 opacity-70">Refuser la demande</p>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-1">
              Commentaire de décision *
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => {
                setCommentaire(e.target.value);
                if (error) setError('');
              }}
              rows="4"
              className="w-full px-6 py-5 bg-surface-50 border border-surface-200 rounded-[2rem] text-surface-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none font-medium leading-relaxed"
              placeholder="Expliquez en détail les raisons de cette décision..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center space-x-3 text-red-600 animate-fadeIn">
              <XCircleIcon className="h-5 w-5 shrink-0" />
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
            className="px-10 rounded-2xl py-4 uppercase tracking-widest text-[10px] font-black"
          >
            Annuler
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={loading}
            disabled={!decision || !commentaire.trim()}
            className="px-12 rounded-2xl py-4 uppercase tracking-widest text-[10px] font-black shadow-xl shadow-primary-500/20"
          >
            Confirmer la décision
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TraitementDemandeModal;
