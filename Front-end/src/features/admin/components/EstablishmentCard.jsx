import React, { useState } from 'react';
import Card from '../../../shared/components/Card';
import { 
  BuildingOffice2Icon, 
  MapPinIcon, 
  TagIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
    <Card className="p-6 bg-white rounded-lg border border-surface-100 shadow-[0_26px_58px_-34px_rgba(15,23,42,0.22)] hover:shadow-[0_32px_76px_-44px_rgba(15,23,42,0.3)] hover:border-primary-100 transition-all group relative overflow-hidden">
      {/* Decorative tag */}
      <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 bg-primary-50 rounded-full opacity-0 group-hover:opacity-50 transition-all duration-500 scale-0 group-hover:scale-100"></div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 min-w-0">
            <h3 className="text-lg font-black text-surface-900 truncate uppercase tracking-tight">{establishment.nom}</h3>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
              establishment.actif 
                ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${establishment.actif ? 'bg-teal-500 animate-pulse' : 'bg-rose-500'}`}></div>
              {establishment.actif ? 'Actif' : 'Inactif'}
            </div>
          </div>
          
          <div className="p-3 bg-surface-50 rounded-xl border border-surface-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
            <BuildingOffice2Icon className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex items-center text-xs font-bold text-surface-600 bg-surface-50/50 p-2.5 rounded-xl border border-surface-50 group-hover:bg-white group-hover:border-surface-100 transition-all">
            <TagIcon className="w-4 h-4 text-primary-500 mr-3 shrink-0" />
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest mr-2">Code:</span>
            <span className="font-mono truncate">{establishment.code}</span>
          </div>
          
          <div className="flex items-start text-xs font-bold text-surface-600 bg-surface-50/50 p-2.5 rounded-xl border border-surface-50 group-hover:bg-white group-hover:border-surface-100 transition-all">
            <MapPinIcon className="w-4 h-4 text-primary-500 mr-3 shrink-0 mt-0.5" />
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest mr-2">Adresse:</span>
            <span className="break-words line-clamp-2">{establishment.adresse}</span>
          </div>
        </div>
        
        <div className="pt-4 flex items-center justify-between gap-4 border-t border-surface-50">
          <div className="flex items-center space-x-3">
            <div className="relative inline-flex items-center cursor-pointer group/toggle">
              <input
                type="checkbox"
                checked={establishment.actif}
                onChange={handleToggleStatus}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500 transition-colors"></div>
            </div>
            <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest">
              {establishment.actif ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {!showConfirm ? (
              <>
                <button
                  onClick={() => onEdit(establishment)}
                  className="p-2.5 bg-white border border-surface-200 text-surface-500 rounded-xl hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all"
                  title="Modifier"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="p-2.5 bg-white border border-surface-200 text-surface-500 rounded-xl hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                  title="Supprimer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center bg-rose-50 p-1 rounded-xl border border-rose-100 animate-slideLeft">
                <button
                  onClick={handleDelete}
                  className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all"
                  title="Confirmer"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="p-2 text-rose-600 hover:text-rose-800 transition-all"
                  title="Annuler"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EstablishmentCard;
