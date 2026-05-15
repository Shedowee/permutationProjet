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
  CalendarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
      size="lg"
    >
      <div className="space-y-6">
        {/* Informations de la demande */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-50 rounded-lg p-5 border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10">
              <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Informations du Formateur
              </h3>
              <div className="space-y-1">
                <p className="text-surface-900 font-black text-base sm:text-lg tracking-tight">{demande.utilisateurNom}</p>
                <p className="text-surface-500 text-xs font-bold uppercase tracking-widest">{demande.utilisateurEmail}</p>
              </div>
            </div>

            <div className="bg-primary-50/30 rounded-lg p-5 border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10">
              <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-3 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                Destination Souhaitée
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-soft text-primary-600 shrink-0 border-2 border-jb-green/20">
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-surface-900 font-black text-sm leading-snug">{demande.etablissementSouhaite}</p>
                    <p className="text-primary-600 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary-500"></span>
                      {demande.villeSouhaitee}, {demande.regionSouhaitee}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-surface-50 rounded-lg p-5 border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 h-full flex flex-col">
              <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Motif & Justificatif
              </h3>
              <div className="bg-white/50 p-4 rounded-lg border-2 border-jb-cyan/20 mb-4 flex-1">
                <p className="text-surface-700 italic text-sm font-bold leading-relaxed max-h-24 overflow-y-auto custom-scrollbar pr-1">
                  "{demande.motif}"
                </p>
              </div>
              {demande.documentJoint && (
                <a
                  href={`${import.meta.env.VITE_API_URL}/storage/${demande.documentJoint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 bg-white rounded-lg border-2 border-jb-green/20 hover:border-primary-300 transition-standard group shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-xl text-primary-600 group-hover:scale-110 transition-standard">
                      <PaperClipIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-surface-900 uppercase tracking-widest">Consulter le justificatif</span>
                  </div>
                  <CheckBadgeIcon className="h-5 w-5 text-primary-500" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire de décision */}
        <div className="pt-6 border-t-2 border-jb-cyan/15 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-surface-900 uppercase tracking-[0.2em] flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-primary-600" />
              Décision de la Commission
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-surface-400 uppercase tracking-widest">
              <CalendarIcon className="h-4 w-4" />
              <span>Soumis le {demande.dateDemande}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setDecision('VALIDE')}
              className={`p-6 rounded-lg border-2 transition-standard flex flex-col items-center text-center gap-4 ${
                decision === 'VALIDE'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-primary'
                  : 'border-2 border-jb-green/20 bg-surface-50 text-surface-400 hover:border-primary-200 hover:bg-primary-50/30'
              }`}
            >
              <div className={`p-3 rounded-lg transition-standard ${decision === 'VALIDE' ? 'bg-primary-500 text-white shadow-lg' : 'bg-white text-surface-200 shadow-soft'}`}>
                <CheckCircleIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-xs">Approuver</p>
                <p className="text-[10px] font-bold mt-1 opacity-60">Valider la permutation</p>
              </div>
            </button>

            <button
              onClick={() => setDecision('REFUSE')}
              className={`p-6 rounded-lg border-2 transition-standard flex flex-col items-center text-center gap-4 ${
                decision === 'REFUSE'
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-soft shadow-red-500/10'
                  : 'border-2 border-jb-cyan/20 bg-surface-50 text-surface-400 hover:border-red-200 hover:bg-red-50/30'
              }`}
            >
              <div className={`p-3 rounded-lg transition-standard ${decision === 'REFUSE' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-surface-200 shadow-soft'}`}>
                <XCircleIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-xs">Rejeter</p>
                <p className="text-[10px] font-bold mt-1 opacity-60">Refuser la demande</p>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] ml-2">
              Commentaire de décision (optionnel)
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => {
                setCommentaire(e.target.value);
                if (error) setError('');
              }}
              rows="3"
              className="input-field py-4 px-5 min-h-[96px] resize-none font-bold"
              placeholder="Veuillez justifier votre décision..."
              disabled={loading}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600"
              >
                <XCircleIcon className="h-5 w-5 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t-2 border-jb-cyan/15">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-8"
          >
            Annuler
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!decision}
            className="w-full sm:w-auto px-10 shadow-primary"
          >
            Confirmer la décision
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TraitementDemandeModal;
