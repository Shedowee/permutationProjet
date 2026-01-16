import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import SingleEstablishmentCard from '../components/SingleEstablishmentCard';
import EstablishmentForm from '../components/EstablishmentForm';
import Modal from '../../../shared/components/Modal';
import { fetchEtablissement, updateEtablissement } from '../redux/adminSlice';

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Fiche Établissement</h1>
          <p className="text-gray-400 mt-2">Gérer les informations de l'établissement unique</p>
        </div>
        
        {/* Fiche d'établissement unique */}
        {establishment && (
          <SingleEstablishmentCard
            establishment={establishment}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
          />
        )}
        
        {/* Modal pour modifier l'établissement */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modifier l'établissement"
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