import React from 'react';
import Card from '../../../shared/components/Card';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChatBubbleLeftRightIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

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
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          icon: ClockIcon,
          label: 'En attente'
        };
      case 'VALIDE':
        return {
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          icon: CheckCircleIcon,
          label: 'Validée'
        };
      case 'REFUSE':
        return {
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          icon: XCircleIcon,
          label: 'Refusée'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: ClockIcon,
          label: 'Inconnu'
        };
    }
  };

  /**
   * Formate une date pour l'affichage
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = getStatusInfo(demande.etat);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* En-tête avec statut principal */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Demande #{demande.id}
            </h1>
            <p className="text-gray-400">
              Demandée le {formatDate(demande.dateDemande)}
            </p>
          </div>
          
          <div className={`flex items-center px-4 py-2 rounded-full border ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">{statusInfo.label}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la demande */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
              Détails de la demande
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Période demandée
                </label>
                <div className="text-white font-medium">
                  Du {demande.dateDebut}
                </div>
                <div className="text-white font-medium">
                  Au {demande.dateFin}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nombre de jours
                </label>
                <div className="text-white font-medium">
                  {Math.ceil((new Date(demande.dateFin) - new Date(demande.dateDebut)) / (1000 * 60 * 60 * 24)) + 1} jours
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Motif de la demande
                </label>
                <div className="text-white bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  {demande.motif}
                </div>
              </div>
            </div>
          </Card>

          {/* Commentaire de la commission */}
          {(demande.etat === 'VALIDE' || demande.etat === 'REFUSE') && demande.commentaire && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-purple-400" />
                Réponse de la commission
              </h2>
              
              <div className={`p-4 rounded-lg border ${
                demande.etat === 'VALIDE' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-start">
                  <div className={`mr-3 mt-1 p-1 rounded-full ${
                    demande.etat === 'VALIDE' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {demande.etat === 'VALIDE' ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <XCircleIcon className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${
                      demande.etat === 'VALIDE' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {demande.etat === 'VALIDE' ? 'Demande validée' : 'Demande refusée'}
                    </p>
                    <p className="text-white mt-2 whitespace-pre-wrap">
                      {demande.commentaire}
                    </p>
                    {demande.dateValidation && (
                      <p className="text-sm text-gray-400 mt-2">
                        Traitée le {formatDate(demande.dateValidation)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Informations latérales */}
        <div className="space-y-6">
          {/* Statut actuel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Statut actuel</h3>
            
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full border ${statusInfo.color} mb-3`}>
                <StatusIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">{statusInfo.label}</span>
              </div>
              
              <div className="text-sm text-gray-400">
                {demande.etat === 'EN_ATTENTE' && 'Votre demande est en cours d\'examen'}
                {demande.etat === 'VALIDE' && 'Votre demande a été approuvée'}
                {demande.etat === 'REFUSE' && 'Votre demande a été refusée'}
              </div>
            </div>
          </Card>

          {/* Timeline simplifiée */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Historique</h3>
            
            <div className="space-y-4">
              {/* Soumission */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mr-3">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Demande soumise</p>
                  <p className="text-gray-400 text-xs">{formatDate(demande.dateDemande)}</p>
                </div>
              </div>

              {/* Traitement */}
              {demande.etat !== 'EN_ATTENTE' && (
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                    demande.etat === 'VALIDE' 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  } flex items-center justify-center mr-3`}>
                    {demande.etat === 'VALIDE' ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      demande.etat === 'VALIDE' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {demande.etat === 'VALIDE' ? 'Demande validée' : 'Demande refusée'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {demande.dateValidation ? formatDate(demande.dateValidation) : 'Date non disponible'}
                    </p>
                  </div>
                </div>
              )}

              {/* En attente */}
              {demande.etat === 'EN_ATTENTE' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mr-3">
                    <ClockIcon className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">En attente de traitement</p>
                    <p className="text-gray-400 text-xs">La commission examinera votre demande prochainement</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions possibles */}
          {demande.etat === 'EN_ATTENTE' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Vous pouvez modifier ou annuler votre demande tant qu'elle est en attente
                </p>
                
                <div className="flex flex-col space-y-2">
                  <button className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors duration-200">
                    Modifier la demande
                  </button>
                  <button className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors duration-200">
                    Annuler la demande
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailDemande;