import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEtablissements, 
  createEtablissement, 
  updateEtablissement, 
  deleteEtablissement 
} from '../redux/adminSlice';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import Table from '../../../shared/components/Table';
import EstablishmentForm from '../components/EstablishmentForm';
import { 
  BuildingOffice2Icon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const EtablissementManagement = () => {
  const dispatch = useDispatch();
  const { data: establishments, loading, error, meta } = useSelector(state => state.admin.etablissement);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchEtablissements({ page, limit, search: searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleCreate = () => {
    setSelectedEstablishment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (etab) => {
    setSelectedEstablishment(etab);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      try {
        await dispatch(deleteEtablissement(id)).unwrap();
      } catch (err) {
        alert(err || 'Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (etab) => {
    try {
      await dispatch(updateEtablissement({
        id: etab.id,
        actif: !etab.actif,
      })).unwrap();
    } catch (err) {
      alert(err || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedEstablishment) {
        await dispatch(updateEtablissement(formData)).unwrap();
      } else {
        await dispatch(createEtablissement(formData)).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err || 'Erreur lors de l\'enregistrement');
    }
  };

  const filteredEstablishments = useMemo(() => establishments, [establishments]);

  const columns = [
    {
      header: "Établissement",
      key: "name",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-surface-900">{val}</span>
          <span className="text-[10px] text-surface-400 flex items-center mt-1">
            <MapPinIcon className="w-3 h-3 mr-1" />
            {row.address || 'Pas d\'adresse'}
          </span>
        </div>
      )
    },
    {
      header: "Ville / Région",
      key: "ville",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-surface-700">{row.city_label || val?.value?.libelle || '—'}</span>
          <span className="text-[10px] text-surface-400 uppercase tracking-widest">{row.region_label || val?.parent?.value?.libelle || '—'}</span>
        </div>
      )
    },
    {
      header: "Contact",
      key: "contact",
      render: (_, row) => (
        <div className="flex flex-col space-y-1">
          {row.contact_email && (
            <span className="text-[11px] text-surface-600 flex items-center">
              <EnvelopeIcon className="w-3 h-3 mr-1 text-primary-500" />
              {row.contact_email}
            </span>
          )}
          {row.contact_phone && (
            <span className="text-[11px] text-surface-600 flex items-center">
              <PhoneIcon className="w-3 h-3 mr-1 text-primary-500" />
              {row.contact_phone}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Statut",
      key: "actif",
      render: (val, row) => (
        <div className="flex flex-col gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
            val 
            ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' 
            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
          }`}>
            {val ? 'Actif' : 'Inactif'}
          </span>
          <button
            type="button"
            onClick={() => handleToggleActive(row)}
            className="w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-surface-200 text-surface-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all"
          >
            {val ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleEdit(row)}
            className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all rounded-lg"
            title="Modifier"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-2 text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-lg"
            title="Supprimer"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-surface-900 tracking-tight flex items-center">
              <BuildingOffice2Icon className="w-10 h-10 mr-4 text-primary-600" />
              Établissements
            </h1>
            <p className="text-surface-500 mt-2 font-medium">Gérez le réseau des centres OFPPT à travers le Maroc</p>
          </div>
          
          <Button 
            variant="primary" 
            size="lg" 
            icon={PlusIcon}
            onClick={handleCreate}
            className="shadow-[0_24px_50px_-28px_rgba(47,123,229,0.3)]"
          >
            Ajouter un établissement
          </Button>
        </div>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="p-6 col-span-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-500/10 rounded-lg text-primary-600">
                <BuildingOffice2Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Total Centres</p>
                <p className="text-2xl font-black text-surface-900">{establishments.length}</p>
              </div>
            </div>
          </Card>
          
          <div className="col-span-1 lg:col-span-3">
            <Card className="p-2 h-full flex items-center px-4">
              <input 
                type="text"
                placeholder="Rechercher par nom ou ville..."
                value={searchTerm}
                onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
                className="w-full bg-[#D8E9FB] border border-jb-cyan/20 rounded-lg focus:ring-2 focus:ring-jb-green/15 text-surface-900 font-bold placeholder:text-surface-400 px-2 py-3 sm:px-3"
              />
            </Card>
          </div>
        </div>

        {/* List Section */}
        <Card className="overflow-hidden border-none shadow-[0_32px_76px_-44px_rgba(15,23,42,0.24)]">
          <Table 
            columns={columns} 
            data={filteredEstablishments} 
            loading={loading}
            pagination={{
              currentPage: meta?.current_page || page,
              totalPages: meta?.last_page || 1,
              totalItems: meta?.total ?? filteredEstablishments.length,
              onPageChange: (p) => setPage(p),
              pageSize: limit,
            }}
          />
        </Card>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEstablishment ? "Modifier l'établissement" : "Nouvel établissement"}
        size="lg"
      >
        <EstablishmentForm 
          establishment={selectedEstablishment}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </Layout>
  );
};

export default EtablissementManagement;
