import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { STATUS_BADGES, ACTION_BUTTON_STYLES } from '../../../shared/constants/constants';
import { MagnifyingGlassIcon, PlusIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { listRoles } from '../../../services/adminService';
import { listUserStatuses } from '../../../services/paramService';
import { listUsers } from '../../../services/usersService';
import { deleteUser as apiDeleteUser } from '../../../services/usersService';
import { useToast } from '../../../shared/context/useToast';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';

const UserManagement = () => {
  const globalSearchTerm = useSelector(selectSearchTerm);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [u, r, s] = await Promise.all([
          listUsers(),
          listRoles(),
          listUserStatuses(),
        ]);
        setUsers(u);
        setRoles(r);
        setStatuses(s);
      } catch {
        // Silent fail for now
      }
    })();
  }, []);
  
  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchToUse = searchTerm || globalSearchTerm;
      const matchesSearch = user.name.toLowerCase().includes(searchToUse.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchToUse.toLowerCase());
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || String(user.status).toLowerCase() === String(filterStatus).toLowerCase();
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, globalSearchTerm, filterRole, filterStatus]);

  const handleDeleteUser = async (userId) => {
    try {
      await apiDeleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      success("Utilisateur supprimé avec succès");
    } catch {
      error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const columns = [
    { 
      header: 'Nom', 
      key: 'name',
      render: (value) => <span className="font-medium text-jb-text-primary">{value}</span>
    },
    { 
      header: 'Email', 
      key: 'email',
      render: (value) => <span className="text-jb-text-secondary">{value}</span>
    },
    { 
      header: 'Rôle', 
      key: 'role',
      render: (value) => {
        const role = roles.find(r => r.value === value);
        return <span className="text-jb-cyan font-medium">{role?.label || value}</span>;
      }
    },
    { 
      header: 'Statut', 
      key: 'status',
      render: (value) => {
        const status = statuses.find(s => s.value === String(value).toLowerCase());
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
      render: (value) => <span className="text-jb-text-muted text-sm">{value}</span>
    },
    { 
      header: 'Actions', 
      key: 'actions',
      render: (_value, row) => (
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
          <h1 className="text-3xl font-bold text-jb-text-primary">Gestion des Utilisateurs</h1>
          <p className="text-jb-text-secondary mt-2">Gérer les comptes et les permissions des utilisateurs</p>
        </div>
        
        {/* Controls */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-jb-text-muted" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-0 bg-[#D8E9FB] py-2 pl-10 pr-10 text-jb-text-primary placeholder:text-jb-text-muted focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-jb-text-primary"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  className="rounded-lg border-0 bg-[#D8E9FB] py-2 px-3 text-jb-text-primary focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10 min-w-[150px]"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Tous les rôles</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                
                <select
                  className="rounded-lg border-0 bg-[#D8E9FB] py-2 px-3 text-jb-text-primary focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10 min-w-[150px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  {statuses.map(status => (
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
              <p className="text-jb-text-secondary">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.name}</strong> ?
              </p>
              <p className="text-jb-text-muted text-sm">
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
