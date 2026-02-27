import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { OFPPT_ENTITY_TYPES, VALIDATION_MESSAGES } from '../../../shared/constants/constants';
import { 
  BuildingOffice2Icon, 
  PencilIcon, 
  PlusIcon, 
  TrashIcon, 
  BookOpenIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../../services/api';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';

const OFPPTManagement = () => {
  const globalSearchTerm = useSelector(selectSearchTerm);
  const [establishments, setEstablishments] = useState([]);
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [trainees, setTrainees] = useState([]);

  // State for modals and forms
  const [activeTab, setActiveTab] = useState('establishments');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Load establishments from backend
  useEffect(() => {
    let mounted = true;
    api.get('/api/etablissements', { withCredentials: true })
      .then((res) => {
        const list = res.data?.data ?? [];
        const mapped = list.map((e) => ({
          id: e.id,
          code: e.code || '',
          nom: e.nom || '',
          adresse: e.adresse || '',
          actif: !!e.actif,
        }));
        if (mounted) setEstablishments(mapped);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const currentEntities = useMemo(() => establishments, [establishments]);

  // Filtered entities
  const filteredEntities = useMemo(() => {
    return currentEntities.filter(entity => {
      const searchToUse = searchTerm || globalSearchTerm;
      const entityValues = Object.values(entity);
      return entityValues.some(value => 
        value && value.toString().toLowerCase().includes(searchToUse.toLowerCase())
      );
    });
  }, [currentEntities, searchTerm, globalSearchTerm]);

  // Handle adding a new entity
  const handleAddEntity = () => {
    setFormData({});
    setErrors({});
    setShowAddModal(true);
  };

  // Handle editing an entity
  const handleEditEntity = (entity) => {
    setEditingEntity(entity);
    setFormData({ ...entity });
    setErrors({});
    setShowEditModal(true);
  };

  // Handle deleting an entity
  const handleDeleteEntity = (entity) => {
    setEntityToDelete(entity);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (entityToDelete) {
      switch(activeTab) {
        case 'establishments':
          setEstablishments(establishments.filter(est => est.id !== entityToDelete.id));
          break;
        case 'fields':
          setFields(fields.filter(field => field.id !== entityToDelete.id));
          break;
        case 'groups':
          setGroups(groups.filter(group => group.id !== entityToDelete.id));
          break;
        case 'trainees':
          setTrainees(trainees.filter(trainee => trainee.id !== entityToDelete.id));
          break;
      }
      setShowDeleteModal(false);
      setEntityToDelete(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!formData[key]) {
        newErrors[key] = VALIDATION_MESSAGES.required;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (editingEntity) {
      // Update existing entity
      switch(activeTab) {
        case 'establishments':
          setEstablishments(establishments.map(est => 
            est.id === editingEntity.id ? { ...est, ...formData } : est
          ));
          break;
        case 'fields':
          setFields(fields.map(field => 
            field.id === editingEntity.id ? { ...field, ...formData } : field
          ));
          break;
        case 'groups':
          setGroups(groups.map(group => 
            group.id === editingEntity.id ? { ...group, ...formData } : group
          ));
          break;
        case 'trainees':
          setTrainees(trainees.map(trainee => 
            trainee.id === editingEntity.id ? { ...trainee, ...formData } : trainee
          ));
          break;
      }
      setShowEditModal(false);
      setEditingEntity(null);
    } else {
      // Add new entity
      const newEntity = {
        id: Date.now(),
        ...formData
      };
      
      switch(activeTab) {
        case 'establishments':
          setEstablishments([...establishments, newEntity]);
          break;
        case 'fields':
          setFields([...fields, newEntity]);
          break;
        case 'groups':
          setGroups([...groups, newEntity]);
          break;
        case 'trainees':
          setTrainees([...trainees, newEntity]);
          break;
      }
      setShowAddModal(false);
    }
    
    setFormData({});
    setErrors({});
  };

  // Get columns based on active tab
  const getColumns = () => {
    switch(activeTab) {
      case 'establishments':
        return [
          { header: 'Nom', key: 'name', render: (value) => <span className="font-medium text-white">{value}</span> },
          { header: 'Ville', key: 'city', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Directeur', key: 'director', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Étudiants', key: 'students', render: (value) => <span className="text-white font-medium">{value}</span> },
          { header: 'Personnel', key: 'staff', render: (value) => <span className="text-gray-300">{value}</span> },
          { 
            header: 'Actions', 
            key: 'actions',
            render: (value, row) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 hover:from-purple-600/30 hover:to-violet-600/30 border border-purple-500/30 transition-all duration-200"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-600/30 hover:to-pink-600/30 border border-red-500/30 transition-all duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )
          },
        ];
      case 'fields':
        return [
          { header: 'Nom', key: 'name', render: (value) => <span className="font-medium text-white">{value}</span> },
          { header: 'Établissement', key: 'establishment', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Niveau', key: 'level', render: (value) => <span className="text-blue-400 font-medium">{value}</span> },
          { header: 'Durée', key: 'duration', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Étudiants', key: 'students', render: (value) => <span className="text-white font-medium">{value}</span> },
          { 
            header: 'Actions', 
            key: 'actions',
            render: (value, row) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 hover:from-purple-600/30 hover:to-violet-600/30 border border-purple-500/30 transition-all duration-200"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-600/30 hover:to-pink-600/30 border border-red-500/30 transition-all duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )
          },
        ];
      case 'groups':
        return [
          { header: 'Nom', key: 'name', render: (value) => <span className="font-medium text-white">{value}</span> },
          { header: 'Filière', key: 'field', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Établissement', key: 'establishment', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Étudiants', key: 'students', render: (value) => <span className="text-white font-medium">{value}</span> },
          { header: 'Année', key: 'year', render: (value) => <span className="text-gray-300">{value}</span> },
          { 
            header: 'Actions', 
            key: 'actions',
            render: (value, row) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 hover:from-purple-600/30 hover:to-violet-600/30 border border-purple-500/30 transition-all duration-200"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-600/30 hover:to-pink-600/30 border border-red-500/30 transition-all duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )
          },
        ];
      case 'trainees':
        return [
          { header: 'Nom', key: 'firstName', render: (value, row) => <span className="font-medium text-white">{value} {row.lastName}</span> },
          { header: 'Groupe', key: 'group', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Email', key: 'email', render: (value) => <span className="text-gray-300 font-mono text-sm">{value}</span> },
          { header: 'Téléphone', key: 'phone', render: (value) => <span className="text-gray-300">{value}</span> },
          { header: 'Statut', key: 'status', render: (value) => (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30`}>
              {value}
            </span>
          ) },
          { 
            header: 'Actions', 
            key: 'actions',
            render: (value, row) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 hover:from-purple-600/30 hover:to-violet-600/30 border border-purple-500/30 transition-all duration-200"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteEntity(row)}
                  className="p-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-600/30 hover:to-pink-600/30 border border-red-500/30 transition-all duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )
          },
        ];
      default:
        return [];
    }
  };

  // Get form fields based on active tab
  const getFormFields = () => {
    switch(activeTab) {
      case 'establishments':
        return [
          { name: 'name', label: 'Nom de l\'établissement', type: 'text', required: true },
          { name: 'city', label: 'Ville', type: 'text', required: true },
          { name: 'director', label: 'Directeur', type: 'text', required: true },
          { name: 'students', label: 'Nombre d\'étudiants', type: 'number', required: true },
          { name: 'staff', label: 'Nombre de personnel', type: 'number', required: true },
        ];
      case 'fields':
        return [
          { name: 'name', label: 'Nom de la filière', type: 'text', required: true },
          { name: 'establishment', label: 'Établissement', type: 'text', required: true },
          { name: 'level', label: 'Niveau', type: 'text', required: true },
          { name: 'duration', label: 'Durée', type: 'text', required: true },
          { name: 'students', label: 'Nombre d\'étudiants', type: 'number', required: true },
        ];
      case 'groups':
        return [
          { name: 'name', label: 'Nom du groupe', type: 'text', required: true },
          { name: 'field', label: 'Filière', type: 'text', required: true },
          { name: 'establishment', label: 'Établissement', type: 'text', required: true },
          { name: 'students', label: 'Nombre d\'étudiants', type: 'number', required: true },
          { name: 'year', label: 'Année académique', type: 'text', required: true },
        ];
      case 'trainees':
        return [
          { name: 'firstName', label: 'Prénom', type: 'text', required: true },
          { name: 'lastName', label: 'Nom de famille', type: 'text', required: true },
          { name: 'group', label: 'Groupe', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
          { name: 'status', label: 'Statut', type: 'text', required: true },
        ];
      default:
        return [];
    }
  };

  const entityLabels = {
    establishments: { singular: 'Établissement', plural: 'Établissements', icon: BuildingOffice2Icon },
    fields: { singular: 'Filière', plural: 'Filières', icon: BookOpenIcon },
    groups: { singular: 'Groupe', plural: 'Groupes', icon: UserGroupIcon },
    trainees: { singular: 'Stagiaire', plural: 'Stagiaires', icon: AcademicCapIcon },
  };

  const CurrentIcon = entityLabels[activeTab].icon;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion Etablissement</h1>
        </div>
        
        {/* Tabs */}
        <Card className="p-0">
          <div className="border-b border-gray-800">
            <nav className="flex -mb-px">
              {Object.entries(entityLabels).map(([key, value]) => {
                const IconComponent = value.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === key ? 'border-blue-500 text-blue-400 bg-gradient-to-r from-blue-500/10 to-indigo-500/10' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'}`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {value.plural}
                  </button>
                );
              })}
            </nav>
          </div>
        </Card>
        
        {/* Controls */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 bg-white/5 py-2 pl-10 pr-10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                placeholder={`Rechercher dans les ${entityLabels[activeTab].plural.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  title="Effacer"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <Button variant="primary" size="md" onClick={handleAddEntity}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Ajouter {entityLabels[activeTab].singular.toLowerCase()}
            </Button>
          </div>
        </Card>
        
        {/* Entities Table */}
        <Card className="p-6">
          <Table 
            data={filteredEntities}
            columns={getColumns()}
            striped={true}
            caption={`${filteredEntities.length} ${entityLabels[activeTab].plural.toLowerCase()} trouvé${filteredEntities.length !== 1 ? 's' : ''}`}
          />
        </Card>
        
        {/* Add Entity Modal */}
        <Modal 
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setFormData({});
            setErrors({});
          }}
          title={`Ajouter un ${entityLabels[activeTab].singular.toLowerCase()}`}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {getFormFields().map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
                  className={`w-full rounded-lg border-0 py-2 px-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border ${errors[field.name] ? 'border-red-500/50' : 'border-white/10'} transition-colors duration-200`}
                  placeholder={`Entrez ${field.label.toLowerCase()}`}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-400">{errors[field.name]}</p>
                )}
              </div>
            ))}
            
            <div className="flex justify-end space-x-3 pt-6">
              <Button 
                variant="secondary" 
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({});
                  setErrors({});
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit"
              >
                Ajouter
              </Button>
            </div>
          </form>
        </Modal>
        
        {/* Edit Entity Modal */}
        <Modal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntity(null);
            setFormData({});
            setErrors({});
          }}
          title={`Modifier ${entityLabels[activeTab].singular.toLowerCase()}`}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {getFormFields().map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
                  className={`w-full rounded-lg border-0 py-2 px-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border ${errors[field.name] ? 'border-red-500/50' : 'border-white/10'} transition-colors duration-200`}
                  placeholder={`Entrez ${field.label.toLowerCase()}`}
                />
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-400">{errors[field.name]}</p>
                )}
              </div>
            ))}
            
            <div className="flex justify-end space-x-3 pt-6">
              <Button 
                variant="secondary" 
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntity(null);
                  setFormData({});
                  setErrors({});
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit"
              >
                Mettre à jour
              </Button>
            </div>
          </form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setEntityToDelete(null);
          }}
          title="Confirmer la suppression"
          size="sm"
        >
          {entityToDelete && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Êtes-vous sûr de vouloir supprimer ce {entityLabels[activeTab].singular.toLowerCase()} <strong>{entityToDelete.name || entityToDelete.firstName + ' ' + entityToDelete.lastName}</strong> ?
              </p>
              <p className="text-gray-400 text-sm">
                Cette action est irréversible et supprimera définitivement l'entrée.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEntityToDelete(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="danger" 
                  onClick={confirmDelete}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default OFPPTManagement;
