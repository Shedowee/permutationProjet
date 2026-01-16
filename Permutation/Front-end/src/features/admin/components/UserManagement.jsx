import React, { useState, useMemo } from 'react';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { USER_ROLES, USER_STATUSES, STATUS_BADGES, ACTION_BUTTON_STYLES } from '../../../shared/constants/constants';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserManagement = () => {
  // Mock users data
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmed Mohamed', email: 'ahmed@ofppt.ma', role: 'admin', status: 'active', createdAt: '2024-01-15', lastLogin: '2024-01-15' },
    { id: 2, name: 'Fatima Karim', email: 'fatima@ofppt.ma', role: 'moderator', status: 'active', createdAt: '2024-01-14', lastLogin: '2024-01-14' },
    { id: 3, name: 'Youssef Tahiri', email: 'youssef@ofppt.ma', role: 'user', status: 'active', createdAt: '2024-01-13', lastLogin: '2024-01-13' },
    { id: 4, name: 'Sara Laaroussi', email: 'sara@ofppt.ma', role: 'user', status: 'blocked', createdAt: '2024-01-10', lastLogin: '2024-01-10' },
    { id: 5, name: 'Omar Benali', email: 'omar@ofppt.ma', role: 'user', status: 'active', createdAt: '2024-01-12', lastLogin: '2024-01-12' },
    { id: 6, name: 'Layla Fassi', email: 'layla@ofppt.ma', role: 'staff', status: 'pending', createdAt: '2024-01-11', lastLogin: '2024-01-11' },
    { id: 7, name: 'Karim Ouali', email: 'karim@ofppt.ma', role: 'student', status: 'active', createdAt: '2024-01-09', lastLogin: '2024-01-09' },
    { id: 8, name: 'Nadia Chraibi', email: 'nadia@ofppt.ma', role: 'trainer', status: 'inactive', createdAt: '2024-01-08', lastLogin: '2024-01-08' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
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
        const role = USER_ROLES.find(r => r.value === value);
        return <span className="text-blue-400 font-medium">{role?.label || value}</span>;
      }
    },
    { 
      header: 'Statut', 
      key: 'status',
      render: (value) => {
        const status = USER_STATUSES.find(s => s.value === value);
        const badgeClass = STATUS_BADGES[value] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {status?.label || value}
          </span>
        );
      }
    },
    { 
      header: 'Créé le', 
      key: 'createdAt',
      render: (value) => <span className="text-gray-400 text-sm">{value}</span>
    },
    { 
      header: 'Actions', 
      key: 'actions',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => console.log('View user:', row)}
            className={`p-2 rounded-lg text-sm font-medium ${ACTION_BUTTON_STYLES.view} transition-all duration-200`}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => console.log('Edit user:', row)}
            className={`p-2 rounded-lg text-sm font-medium ${ACTION_BUTTON_STYLES.edit} transition-all duration-200`}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => confirmDelete(row)}
            className={`p-2 rounded-lg text-sm font-medium ${ACTION_BUTTON_STYLES.delete} transition-all duration-200`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-400 mt-2">Gérer les comptes et les permissions des utilisateurs</p>
        </div>
        
        {/* Controls */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-0 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  className="rounded-lg border-0 bg-white/5 py-2 px-3 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 min-w-[150px]"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Tous les rôles</option>
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                
                <select
                  className="rounded-lg border-0 bg-white/5 py-2 px-3 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 min-w-[150px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  {USER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button variant="primary" size="md" onClick={() => console.log('Add new user')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nouveau compte
            </Button>
          </div>
        </Card>
        
        {/* Users Table */}
        <Card className="p-6">
          <Table 
            data={filteredUsers}
            columns={columns}
            striped={true}
            caption={`${filteredUsers.length} utilisateur${filteredUsers.length !== 1 ? 's' : ''} trouvé${filteredUsers.length !== 1 ? 's' : ''}`}
          />
        </Card>
        
        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}
          title="Confirmer la suppression"
          size="sm"
        >
          {userToDelete && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.name}</strong> ?
              </p>
              <p className="text-gray-400 text-sm">
                Cette action est irréversible et supprimera définitivement le compte.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDeleteUser(userToDelete.id)}
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

export default UserManagement;
