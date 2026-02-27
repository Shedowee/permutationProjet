import React from 'react';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  UserIcon,
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* En-tête avec statut principal */}
      <div className="bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm overflow-hidden relative group">
        <div className="absolute -top-[20%] -right-[10%] w-[30%] h-[150%] bg-secondary-50/30 blur-[80px] -rotate-12 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">
              <CalendarIcon className="h-4 w-4" />
              <span>Dossier de Permutation</span>
            </div>
            <h1 className="text-3xl font-black text-surface-800 tracking-tight">
              Demande <span className="text-primary-500">#{demande.id}</span>
            </h1>
            <p className="text-secondary-600 text-sm font-medium italic">
              Soumise le <span className="text-surface-800 font-bold">{formatDate(demande.dateDemande)}</span>
            </p>
          </div>
          
          <div className={`flex items-center self-start md:self-center px-6 py-3 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] shadow-sm ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-8">
          {/* Destination & Motif */}
          <div className="bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-secondary-50 pb-6">
              <h2 className="text-sm font-black text-surface-800 uppercase tracking-[0.2em] flex items-center">
                <MapPinIcon className="w-5 h-5 mr-3 text-primary-500" />
                Détails de la destination
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-secondary-50/50 rounded-2xl p-6 border border-secondary-100 group hover:border-primary-200 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-secondary-600 group-hover:scale-110 transition-transform">
                    <BuildingOfficeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Établissement</p>
                    <p className="text-surface-800 font-bold leading-tight">{demande.etablissementSouhaite}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-50/50 rounded-2xl p-6 border border-secondary-100 group hover:border-primary-200 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-secondary-600 group-hover:scale-110 transition-transform">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Localisation</p>
                    <p className="text-surface-800 font-bold leading-tight">{demande.villeSouhaitee}</p>
                    <p className="text-secondary-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{demande.regionSouhaitee}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-3 text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Motif de la demande</span>
                </div>
                <div className="bg-secondary-50/30 p-8 rounded-2xl border border-secondary-100 relative">
                  <div className="absolute top-6 left-6 text-primary-100">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8H6v-8h4m2-2H4v12h8V6zM26 8v8h-4v-8h4m2-2h-8v12h8V6z"></path></svg>
                  </div>
                  <p className="text-secondary-800 font-medium italic leading-relaxed relative z-10 pl-8">
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
                    className="flex items-center justify-between p-6 bg-primary-50/50 rounded-2xl border border-primary-100 hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-xl text-primary-500 group-hover:scale-110 transition-transform shadow-sm">
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
            <div className={`rounded-2xl p-8 border shadow-sm relative overflow-hidden group ${
              demande.etat === 'VALIDE' 
                ? 'bg-primary-50/50 border-primary-100' 
                : 'bg-red-50/50 border-red-100'
            }`}>
              <div className={`absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 ${
                demande.etat === 'VALIDE' ? 'text-primary-600' : 'text-red-600'
              }`}>
                {demande.etat === 'VALIDE' ? <CheckCircleIcon className="w-32 h-32" /> : <XCircleIcon className="w-32 h-32" />}
              </div>

              <div className="relative z-10 space-y-6">
                <h2 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center ${
                  demande.etat === 'VALIDE' ? 'text-primary-700' : 'text-red-700'
                }`}>
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
                  Réponse de la commission
                </h2>
                
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white/80 space-y-4">
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
        <div className="space-y-8">
          {/* Statut actuel (Mini Card) */}
          <div className="bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm text-center space-y-6">
            <h3 className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">Statut actuel</h3>
            
            <div className="flex flex-col items-center">
              <div className={`p-6 rounded-2xl border-2 mb-6 ${statusInfo.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <StatusIcon className="w-12 h-12 stroke-[1.5px]" />
              </div>
              
              <div className="space-y-2">
                <p className={`text-lg font-black uppercase tracking-widest ${
                  demande.etat === 'VALIDE' ? 'text-primary-600' : 
                  demande.etat === 'REFUSE' ? 'text-red-600' : 'text-amber-700'
                }`}>
                  {statusInfo.label}
                </p>
                <p className="text-xs font-medium text-secondary-600 leading-relaxed px-4 italic">
                  {demande.etat === 'EN_ATTENTE' && "Votre demande est actuellement en cours d'examen par la commission."}
                  {demande.etat === 'VALIDE' && "Félicitations ! Votre demande de permutation a été officiellement approuvée."}
                  {demande.etat === 'REFUSE' && "Nous regrettons de vous informer que votre demande n'a pas pu être acceptée."}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline d'Historique */}
          <div className="bg-white rounded-2xl p-8 border border-secondary-100 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-surface-800 uppercase tracking-[0.2em] border-b border-secondary-50 pb-4">Historique du dossier</h3>
            
            <div className="space-y-8 relative">
              {/* Ligne verticale décorative */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-secondary-50"></div>

              {/* Soumission */}
              <div className="flex items-start relative z-10 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-surface-800 text-xs font-black uppercase tracking-widest">Demande soumise</p>
                  <p className="text-secondary-400 text-[10px] font-bold mt-0.5">{formatDate(demande.dateDemande)}</p>
                </div>
              </div>

              {/* Traitement */}
              {demande.etat !== 'EN_ATTENTE' && (
                <div className="flex items-start relative z-10 group">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
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
                      {demande.dateValidation ? formatDate(demande.dateValidation) : 'Date non disponible'}
                    </p>
                  </div>
                </div>
              )}

              {/* En attente */}
              {demande.etat === 'EN_ATTENTE' && (
                <div className="flex items-start relative z-10 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mr-4 animate-pulse">
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

export default DetailDemande;
