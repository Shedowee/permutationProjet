import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import CreateUserForm from '../components/CreateUserForm';
import { UserPlusIcon, PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { fetchUsers, createUser, updateUser, deleteUser } from '../redux/adminSlice';
import { listRoles } from '../../../services/adminService';
import { listUserStatuses } from '../../../services/paramService';

const UserManagement = () => {
  const dispatch = useDispatch();
  const usersState = useSelector(state => state.admin.users) || { data: [], loading: false, error: null };
  const users = useMemo(() => usersState.data || [], [usersState.data]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete', 'create'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    dateCreated: '',
    lastLogin: ''
  });
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [uiSuccess, setUiSuccess] = useState('');
  const [uiError, setUiError] = useState('');
  
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);
  
  useEffect(() => {
    (async () => {
      try {
        const data = await listRoles();
        setRoles(data);
      } catch {
        setRoles([]);
      }
    })();
  }, []);
  
  useEffect(() => {
    (async () => {
      try {
        const data = await listUserStatuses();
        setStatuses(data.length ? data : [
          { value: 'actif', label: 'Actif' },
          { value: 'inactif', label: 'Inactif' },
        ]);
      } catch {
        setStatuses([
          { value: 'actif', label: 'Actif' },
          { value: 'inactif', label: 'Inactif' },
        ]);
      }
    })();
  }, []);
  
  // État pour gérer la modal de création d'utilisateur
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (uiSuccess) {
      const t = setTimeout(() => setUiSuccess(''), 4000);
      return () => clearTimeout(t);
    }
  }, [uiSuccess]);

  useEffect(() => {
    if (uiError) {
      const t = setTimeout(() => setUiError(''), 5000);
      return () => clearTimeout(t);
    }
  }, [uiError]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);
  
  const availableStatuses = statuses;

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      dateCreated: user.dateCreated,
      lastLogin: user.lastLogin
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    setUiError('');
    setUiSuccess('');
    dispatch(deleteUser(selectedUser.id))
      .unwrap()
      .then(() => {
        setUiSuccess('Utilisateur supprimé avec succès');
      })
      .catch((err) => {
        setUiError(err || 'Erreur lors de la suppression');
      })
      .finally(() => {
        setShowModal(false);
        setSelectedUser(null);
      });
  };

  const handleSaveUser = () => {
    setUiError('');
    setUiSuccess('');
    dispatch(updateUser({ id: selectedUser.id, userData: formData }))
      .unwrap()
      .then(() => {
        setUiSuccess('Utilisateur mis à jour avec succès');
      })
      .catch((err) => {
        setUiError(err || 'Erreur lors de la mise à jour');
      })
      .finally(() => {
        setShowModal(false);
        setSelectedUser(null);
      });
  };

  // Fonction pour gérer la création d'un utilisateur
  const handleCreateUser = (newUserData) => {
    setUiError('');
    setUiSuccess('');
    dispatch(createUser(newUserData))
      .unwrap()
      .then(() => {
        setUiSuccess('Utilisateur créé avec succès');
      })
      .catch((err) => {
        setUiError(err || 'Erreur lors de la création');
      })
      .finally(() => {
        setShowCreateModal(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const columns = [
    { 
      header: 'Nom', 
      key: 'name',
      render: (value) => <span className="font-medium text-white">{value}</span>
    },
    { 
      header: 'Email', 
      key: 'email',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    { 
      header: 'Rôle', 
      key: 'role',
      render: (value) => {
        const roleLabel = roles.find(r => r.value === value)?.label || value;
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-200 border border-white/10">
            {roleLabel}
          </span>
        );
      }
    },
    { 
      header: 'Statut', 
      key: 'status',
      render: (value) => {
        const cls =
          value === 'actif'
            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : value === 'bloque'
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
            {value}
          </span>
        );
      }
    },
    { 
      header: 'Date création', 
      key: 'dateCreated',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    { 
      header: 'Actions', 
      key: 'actions',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewUser(row)}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors duration-200"
            title="Voir"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleEditUser(row)}
            className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors duration-200"
            title="Modifier"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteUser(row)}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors duration-200"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-400 mt-2">Gérer les comptes utilisateurs et leurs permissions</p>
        </div>
        
        {/* Filters and Search */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="w-full py-2 px-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full py-2 px-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              className="flex items-center"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Nouveau Utilisateur
            </Button>
          </div>
        </Card>
        
        {/* Users Table */}
        <Card className="p-6">
          {uiSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 flex items-start justify-between">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span>{uiSuccess}</span>
              </div>
              <button
                onClick={() => setUiSuccess('')}
                className="text-green-300/80 hover:text-green-200 transition-colors"
                aria-label="Fermer la notification de succès"
              >
                ✕
              </button>
            </div>
          )}
          {uiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 flex items-start justify-between">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                <span>{uiError}</span>
              </div>
              <button
                onClick={() => setUiError('')}
                className="text-red-300/80 hover:text-red-200 transition-colors"
                aria-label="Fermer la notification d'erreur"
              >
                ✕
              </button>
            </div>
          )}
          {usersState.loading ? (
            <div className="py-8 text-center text-gray-400">Chargement des utilisateurs...</div>
          ) : usersState.error ? (
            <div className="py-8 text-center text-red-400">Erreur: {usersState.error}</div>
          ) : (
            <Table 
              data={filteredUsers} 
              columns={columns} 
              caption={`Utilisateurs (${filteredUsers.length})`}
            />
          )}
        </Card>
      </div>
      
      {/* View User Modal */}
      <Modal 
        isOpen={showModal && modalType === 'view'} 
        onClose={() => setShowModal(false)} 
        title="Détails de l'utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Nom</label>
                <p className="text-white font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Email</label>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Rôle</label>
                <p className="text-white font-medium">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Statut</label>
                <p className="text-white font-medium">{selectedUser.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Date de création</label>
                <p className="text-white font-medium">{selectedUser.dateCreated}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Dernière connexion</label>
                <p className="text-white font-medium">{selectedUser.lastLogin}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Edit User Modal */}
      <Modal 
        isOpen={showModal && modalType === 'edit'} 
        onClose={() => setShowModal(false)} 
        title="Modifier l'utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete User Modal */}
      <Modal 
        isOpen={showModal && modalType === 'delete'} 
        onClose={() => setShowModal(false)} 
        title="Confirmer la suppression"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-300">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong className="text-white">{selectedUser.name}</strong> ? 
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal pour créer un utilisateur */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title="Créer un nouvel utilisateur"
        size="lg"
      >
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </Layout>
  );
};

export default UserManagement;
