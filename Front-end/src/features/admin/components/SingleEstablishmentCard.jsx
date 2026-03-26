import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../shared/components/Card';
import { 
  BuildingOffice2Icon, 
  MapPinIcon, 
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

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
    <Card className="p-10 bg-white rounded-[2.5rem] border border-surface-100 shadow-sm overflow-hidden relative group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="flex-1 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-surface-900 tracking-tight uppercase">{establishment.nom}</h2>
              <div className="flex items-center space-x-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">
                <TagIcon className="h-3.5 w-3.5" />
                <span>Identifiant Établissement</span>
              </div>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
              establishment.actif 
                ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${establishment.actif ? 'bg-teal-500 animate-pulse' : 'bg-rose-500'}`}></div>
              {establishment.actif ? 'Actif' : 'Inactif'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="p-6 rounded-3xl bg-surface-50 border border-surface-100 space-y-3">
              <div className="flex items-center space-x-2 text-[10px] font-black text-surface-500 uppercase tracking-widest">
                <TagIcon className="h-4 w-4 text-primary-500" />
                <span>Code Système</span>
              </div>
              <p className="text-xl font-bold text-surface-900 font-mono tracking-wider">{establishment.code}</p>
            </div>
            
            <div className="p-6 rounded-3xl bg-surface-50 border border-surface-100 space-y-3">
              <div className="flex items-center space-x-2 text-[10px] font-black text-surface-500 uppercase tracking-widest">
                <MapPinIcon className="h-4 w-4 text-primary-500" />
                <span>Adresse & Localisation</span>
              </div>
              <p className="text-lg font-bold text-surface-700 leading-relaxed">{establishment.adresse}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-10 border-t border-surface-50 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={establishment.actif}
              onChange={handleToggleStatus}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 transition-colors"></div>
            <span className="ml-4 text-[10px] font-black text-surface-600 uppercase tracking-widest cursor-pointer select-none">
              {establishment.actif ? 'Établissement activé' : 'Établissement désactivé'}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onEdit(establishment)}
          className="flex items-center space-x-3 px-8 py-4 bg-white border-2 border-primary-100 text-primary-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-50 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/10 transition-all group"
        >
          <PencilIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Modifier les informations</span>
        </button>
      </div>
    </Card>
  );
};

export default SingleEstablishmentCard;