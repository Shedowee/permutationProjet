import React, { useState } from 'react';
import Card from '../../../shared/components/Card';

const EstablishmentCard = ({ establishment, onEdit, onDelete, onToggleStatus }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(establishment.id);
    setShowConfirm(false);
  };

  const handleToggleStatus = () => {
    onToggleStatus(establishment.id);
  };

  return (
    <Card className="p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white truncate">{establishment.nom}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              establishment.actif 
                ? 'bg-green-100/10 text-green-400 border border-green-500/30' 
                : 'bg-red-100/10 text-red-400 border border-red-500/30'
            }`}>
              {establishment.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <span className="font-medium text-gray-400 mr-2">Code:</span>
              <span className="truncate">{establishment.code}</span>
            </div>
            
            <div className="flex items-start text-sm text-gray-300">
              <span className="font-medium text-gray-400 mr-2">Adresse:</span>
              <span className="break-words">{establishment.adresse}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={establishment.actif}
              onChange={handleToggleStatus}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-2 text-sm font-medium text-gray-300">
              {establishment.actif ? 'Activé' : 'Désactivé'}
            </span>
          </label>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(establishment)}
            className="px-4 py-2 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors duration-200"
          >
            Modifier
          </button>
          
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors duration-200"
            >
              Supprimer
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EstablishmentCard;