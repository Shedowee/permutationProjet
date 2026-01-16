import React from 'react';
import Card from '../../../shared/components/Card';

/**
 * Composant pour afficher la fiche d'un seul établissement
 * 
 * Ce composant affiche les informations d'un établissement unique
 * avec possibilité de modification et de changement de statut
 */
const SingleEstablishmentCard = ({ establishment, onEdit, onToggleStatus }) => {
  const handleToggleStatus = () => {
    onToggleStatus(establishment.id);
  };

  return (
    <Card className="p-8 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{establishment.nom}</h2>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              establishment.actif 
                ? 'bg-green-100/10 text-green-400 border border-green-500/30' 
                : 'bg-red-100/10 text-red-400 border border-red-500/30'
            }`}>
              {establishment.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center text-lg text-gray-300">
              <span className="font-medium text-gray-400 mr-4 w-24">Code:</span>
              <span className="font-semibold">{establishment.code}</span>
            </div>
            
            <div className="flex items-start text-lg text-gray-300">
              <span className="font-medium text-gray-400 mr-4 w-24">Adresse:</span>
              <span className="font-semibold">{establishment.adresse}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={establishment.actif}
              onChange={handleToggleStatus}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-3 text-lg font-medium text-gray-300">
              {establishment.actif ? 'Établissement activé' : 'Établissement désactivé'}
            </span>
          </label>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => onEdit(establishment)}
            className="px-6 py-3 text-base bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors duration-200 border border-blue-500/30"
          >
            Modifier
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SingleEstablishmentCard;