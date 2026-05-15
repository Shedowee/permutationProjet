import React from 'react';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PaperClipIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

/**
 * Composant pour afficher les détails d'une demande de permutation
 *
 * Affiche :
 * - Informations complètes de la demande
 * - Historique des statuts
 * - Commentaires de la commission
 * - Timeline des événements
 */
const DetailDemande = ({ demande }) => {
  if (!demande) return null;

  /**
   * Obtient la couleur et l'icône selon le statut
   */
  const getStatusInfo = (etat) => {
    switch (etat) {
      case 'EN_ATTENTE':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: ClockIcon,
          label: 'En attente'
        };
      case 'VALIDE':
        return {
          color: 'bg-primary-50 text-primary-700 border-primary-200',
          icon: CheckCircleIcon,
          label: 'Validée'
        };
      case 'REFUSE':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: XCircleIcon,
          label: 'Refusée'
        };
      default:
        return {
          color: 'bg-secondary-50 text-secondary-700 border-secondary-200',
          icon: ClockIcon,
          label: 'Inconnu'
        };
    }
  };

  /**
   * Formate une date pour l'affichage
   */
  const formatDate = (dateString) => {
    return formatDateTime(dateString);
  };

  const statusInfo = getStatusInfo(demande.etat);
  const StatusIcon = statusInfo.icon;
  const currentEstablishment = demande.formateur?.etablissement?.name || demande.formateurEtablissement || '—';
  const currentCity = demande.formateur?.etablissement?.ville?.value?.libelle || demande.formateurVille || demande.formateur?.etablissement?.ville?.name || '—';
  const currentRegion = demande.formateur?.etablissement?.ville?.region?.value?.libelle || demande.formateurRegion || demande.formateur?.etablissement?.ville?.region?.name || '—';
  const submittedAt = demande.dateDemandeComplete || demande.dateDemande || null;
  const processedAt = demande.dateValidation || null;
  const reviewerSource = demande.traitePar || demande.traite_par || demande.processedBy || demande.processed_by || null;
  const reviewerName = demande.traiteParNom
    || demande.traiteParName
    || reviewerSource?.name
    || reviewerSource?.nom
    || [reviewerSource?.prenom, reviewerSource?.nom].filter(Boolean).join(' ')
    || reviewerSource?.full_name
    || reviewerSource?.fullName
    || '—';
  const reviewerEmail = demande.traiteParEmail
    || demande.traiteParMail
    || reviewerSource?.email
    || reviewerSource?.mail
    || '—';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* En-tête avec statut principal */}
      <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] overflow-hidden relative group">
        <div className="absolute -top-[20%] -right-[10%] w-[30%] h-[150%] bg-secondary-50/30 blur-[80px] -rotate-12 group-hover:scale-110 transition-transform duration-700"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">
              <CalendarIcon className="h-4 w-4" />
              <span>Dossier de Permutation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-800 tracking-tight">
              Demande <span className="text-primary-500">#{demande.id}</span>
            </h1>
            <p className="text-secondary-600 text-sm font-medium italic">
              Soumise le <span className="text-surface-800 font-bold">{submittedAt ? formatDate(submittedAt) : formatDate(demande.dateDemande)}</span>
            </p>
          </div>

          <div className={`flex items-center self-start md:self-center px-4 py-2.5 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] shadow-[0_18px_34px_-20px_rgba(15,31,24,0.24)] ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-4">
          {/* Informations administratives */}
          <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] space-y-4">
            <div className="flex items-center justify-between border-b border-secondary-50 pb-3">
              <h2 className="text-sm font-black text-surface-800 uppercase tracking-[0.2em] flex items-center">
                <CalendarIcon className="w-5 h-5 mr-3 text-primary-500" />
                Informations administratives
              </h2>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-secondary-50 text-secondary-700 border-secondary-100">
                Référence #{demande.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MetaItem label="Date de soumission" value={submittedAt ? formatDate(submittedAt) : '—'} />
              <MetaItem label="Date de traitement" value={processedAt ? formatDate(processedAt) : '—'} />
              <MetaItem label="Traité par" value={reviewerName} subValue={reviewerEmail} />
              <MetaItem label="Statut" value={statusInfo.label} />
            </div>
          </div>

          {/* Destination & Motif */}
          <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] space-y-4">
            <div className="flex items-center justify-between border-b border-secondary-50 pb-3">
              <h2 className="text-sm font-black text-surface-800 uppercase tracking-[0.2em] flex items-center">
                <MapPinIcon className="w-5 h-5 mr-3 text-primary-500" />
                Détails de la destination
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-secondary-50/50 rounded-lg p-4 border border-secondary-100 group hover:border-primary-200 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-[0_14px_26px_-16px_rgba(15,31,24,0.2)] text-secondary-600 group-hover:scale-110 transition-transform">
                    <BuildingOfficeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Établissement</p>
                    <p className="text-surface-800 font-bold leading-tight">{demande.etablissementSouhaite}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-50/50 rounded-lg p-4 border border-secondary-100 group hover:border-primary-200 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-[0_14px_26px_-16px_rgba(15,31,24,0.2)] text-secondary-600 group-hover:scale-110 transition-transform">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Localisation</p>
                    <p className="text-surface-800 font-bold leading-tight">{demande.villeSouhaitee}</p>
                    <p className="text-secondary-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{demande.regionSouhaitee}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center space-x-3 text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Motif de la demande</span>
                </div>
              <div className="bg-secondary-50/30 p-3 rounded-lg border border-secondary-100 relative">
                <div className="absolute top-4 left-4 text-primary-100">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8H6v-8h4m2-2H4v12h8V6zM26 8v8h-4v-8h4m2-2h-8v12h8V6z"></path></svg>
                </div>
                  <p className="text-secondary-800 font-medium italic leading-relaxed relative z-10 pl-8 text-sm max-h-20 overflow-y-auto custom-scrollbar">
                    {demande.motif}
                  </p>
                </div>
              </div>

              {demande.documentJoint && (
                <div className="md:col-span-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL}/storage/${demande.documentJoint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-primary-50/50 rounded-lg border border-primary-100 hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-white rounded-xl text-primary-500 group-hover:scale-110 transition-transform shadow-[0_14px_26px_-16px_rgba(15,31,24,0.2)]">
                        <PaperClipIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Document Justificatif</p>
                        <p className="text-surface-800 font-bold text-xs mt-0.5">Cliquez pour consulter la pièce jointe</p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Commentaire de la commission */}
          {(demande.etat === 'VALIDE' || demande.etat === 'REFUSE') && demande.commentaire && (
            <div className={`rounded-lg p-4 lg:p-5 border shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] relative overflow-hidden group ${
              demande.etat === 'VALIDE'
                ? 'bg-primary-50/50 border-primary-100'
                : 'bg-red-50/50 border-red-100'
            }`}>
              <div className={`absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 ${
                demande.etat === 'VALIDE' ? 'text-primary-600' : 'text-red-600'
              }`}>
                {demande.etat === 'VALIDE' ? <CheckCircleIcon className="w-32 h-32" /> : <XCircleIcon className="w-32 h-32" />}
              </div>

              <div className="relative z-10 space-y-4">
                <h2 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center ${
                  demande.etat === 'VALIDE' ? 'text-primary-700' : 'text-red-700'
                }`}>
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
                  Réponse de la commission
                </h2>

                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/80 space-y-3">
                  <p className="text-surface-800 font-bold leading-relaxed italic">
                    "{demande.commentaire}"
                  </p>
                  {demande.dateValidation && (
                    <div className="flex items-center space-x-2 text-[10px] font-black text-secondary-400 uppercase tracking-widest pt-4 border-t border-secondary-100">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Traitée le {formatDate(demande.dateValidation)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informations latérales */}
        <div className="space-y-4">
          {/* Formateur concerné */}
          <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] space-y-4">
            <h3 className="text-[10px] font-black text-surface-800 uppercase tracking-[0.2em] border-b border-secondary-50 pb-3">
              Formateur concerné
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Nom</p>
                  <p className="text-surface-800 font-bold leading-tight">{demande.utilisateurNom || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-surface-800 font-bold leading-tight break-all">{demande.utilisateurEmail || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Téléphone</p>
                  <p className="text-surface-800 font-bold leading-tight">{demande.utilisateurPhone || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Adresse</p>
                  <p className="text-surface-800 font-bold leading-tight">{demande.utilisateurAddress || '—'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Affectation actuelle */}
          <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] space-y-4">
            <h3 className="text-[10px] font-black text-surface-800 uppercase tracking-[0.2em] border-b border-secondary-50 pb-3">
              Affectation actuelle
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <BuildingOfficeIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Établissement</p>
                  <p className="text-surface-800 font-bold leading-tight">{currentEstablishment}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Ville</p>
                  <p className="text-surface-800 font-bold leading-tight">{currentCity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Région</p>
                  <p className="text-surface-800 font-bold leading-tight">{currentRegion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Traitement */}
          <div className="bg-white rounded-lg p-6 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] space-y-5">
            <h3 className="text-[10px] font-black text-surface-800 uppercase tracking-[0.2em] border-b border-secondary-50 pb-4">
              Traitement
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">État de la demande</p>
                  <p className="text-surface-800 font-bold leading-tight">{statusInfo.label}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Traité par</p>
                  <p className="text-surface-800 font-bold leading-tight">{reviewerName}</p>
                  <p className="text-secondary-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{reviewerEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Traité le</p>
                  <p className="text-surface-800 font-bold leading-tight">
                    {processedAt ? formatDate(processedAt) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statut actuel (Mini Card) */}
          <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] text-center space-y-4">
            <h3 className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">Statut actuel</h3>

            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-lg border-2 mb-3 ${statusInfo.color} shadow-[0_18px_34px_-20px_rgba(15,31,24,0.24)] group-hover:scale-110 transition-transform`}>
                <StatusIcon className="w-10 h-10 stroke-[1.5px]" />
              </div>

              <div className="space-y-2">
                <p className={`text-lg font-black uppercase tracking-widest ${
                  demande.etat === 'VALIDE' ? 'text-primary-600' :
                  demande.etat === 'REFUSE' ? 'text-red-600' : 'text-amber-700'
                }`}>
                  {statusInfo.label}
                </p>
                <p className="text-xs font-medium text-secondary-600 leading-relaxed px-3 italic">
                  {demande.etat === 'EN_ATTENTE' && "Votre demande est actuellement en cours d'examen par la commission."}
                  {demande.etat === 'VALIDE' && "Félicitations ! Votre demande de permutation a été officiellement approuvée."}
                  {demande.etat === 'REFUSE' && "Nous regrettons de vous informer que votre demande n'a pas pu être acceptée."}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline d'Historique */}
          <div className="bg-white rounded-lg p-4 lg:p-5 border border-secondary-100 shadow-[0_28px_64px_-40px_rgba(15,31,24,0.28)] space-y-4">
            <h3 className="text-[10px] font-black text-surface-800 uppercase tracking-[0.2em] border-b border-secondary-50 pb-3">Historique du dossier</h3>

            <div className="space-y-4 relative">
              {/* Ligne verticale décorative */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-secondary-50"></div>

              {/* Soumission */}
              <div className="flex items-start relative z-10 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-800 text-xs font-black uppercase tracking-widest">Demande soumise</p>
                  <p className="text-secondary-400 text-[10px] font-bold mt-0.5">{submittedAt ? formatDate(submittedAt) : formatDate(demande.dateDemande)}</p>
                </div>
              </div>

              {/* Traitement */}
              {demande.etat !== 'EN_ATTENTE' && (
                <div className="flex items-start relative z-10 group">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform ${
                    demande.etat === 'VALIDE' ? 'bg-primary-50 text-primary-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {demande.etat === 'VALIDE' ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${
                      demande.etat === 'VALIDE' ? 'text-primary-600' : 'text-red-600'
                    }`}>
                      {demande.etat === 'VALIDE' ? 'Dossier Validé' : 'Dossier Refusé'}
                    </p>
                    <p className="text-secondary-400 text-[10px] font-bold mt-0.5">
                      {processedAt ? formatDate(processedAt) : 'Date non disponible'}
                    </p>
                  </div>
                </div>
              )}

              {/* En attente */}
              {demande.etat === 'EN_ATTENTE' && (
                <div className="flex items-start relative z-10 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mr-3 animate-pulse">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-amber-700 text-xs font-black uppercase tracking-widest">En cours de traitement</p>
                    <p className="text-secondary-400 text-[10px] font-bold mt-0.5">Examen par la commission</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetaItem = ({ label, value, subValue }) => (
  <div className="rounded-lg border border-secondary-100 bg-secondary-50/40 p-3.5">
    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-sm font-bold text-surface-800 leading-tight">{value}</p>
    {subValue && <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-1">{subValue}</p>}
  </div>
);

export default DetailDemande;
