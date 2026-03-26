import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../../shared/layouts/Layout';
import SingleEstablishmentCard from '../components/SingleEstablishmentCard';
import EstablishmentForm from '../components/EstablishmentForm';
import Modal from '../../../shared/components/Modal';
import { fetchEtablissement, updateEtablissement } from '../redux/adminSlice';
import { BuildingOffice2Icon, ShieldCheckIcon } from '@heroicons/react/24/outline';

/**
 * Composant de gestion d'un seul établissement
 * 
 * Ce composant gère un seul établissement (pas de liste)
 * avec une interface utilisateur moderne basée sur une fiche unique.
 */
const EtablissementManagement = () => {
  const dispatch = useDispatch();
  const establishment = useSelector(state => state.admin.etablissement.data);
  
  // État pour gérer la modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    dispatch(fetchEtablissement());
  }, [dispatch]);

  /**
   * Fonction pour mettre à jour l'établissement
   * @param {Object} updatedEstablishment - Les données mises à jour de l'établissement
   */
  const handleUpdate = (updatedEstablishment) => {
    dispatch(updateEtablissement(updatedEstablishment));
    setIsModalOpen(false);
  };


  /**
   * Fonction pour activer/désactiver l'établissement
   */
  const handleToggleStatus = () => {
    if (establishment) {
      dispatch(updateEtablissement({
        ...establishment,
        actif: !establishment.actif
      }));
    }
  };

  /**
   * Ouvre la modal pour modifier l'établissement
   */
  const openEditModal = () => {
    setIsModalOpen(true);
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white rounded-[1.5rem] shadow-sm border border-surface-100">
              <BuildingOffice2Icon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Administration</span>
              </div>
              <h1 className="text-3xl font-black text-surface-900 tracking-tight">Fiche <span className="text-primary-600">Établissement</span></h1>
              <p className="text-surface-600 text-sm font-bold">Gérez les informations de l'établissement unique</p>
            </div>
          </div>
        </div>
        
        {/* Fiche d'établissement unique */}
        {establishment && (
          <div className="max-w-4xl">
            <SingleEstablishmentCard
              establishment={establishment}
              onEdit={openEditModal}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        )}
        
        {/* Modal pour modifier l'établissement */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modifier l'établissement"
          size="lg"
        >
          {establishment && (
            <EstablishmentForm
              establishment={establishment}
              onSubmit={handleUpdate}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default EtablissementManagement;