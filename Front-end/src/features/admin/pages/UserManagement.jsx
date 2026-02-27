import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import CreateUserForm from '../components/CreateUserForm';
import { UserPlusIcon, PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchUsers, createUser, updateUser, deleteUser } from '../redux/adminSlice';
import { listRoles } from '../../../services/adminService';
import { listUserStatuses } from '../../../services/paramService';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';
import { getUserDetail } from '../../../services/usersService';
import { 
  IdentificationIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  BuildingOfficeIcon, 
  CalendarIcon,
  DocumentIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const UserManagement = () => {
  const dispatch = useDispatch();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const usersState = useSelector(state => state.admin.users) || { data: [], loading: false, error: null };
  const users = useMemo(() => usersState.data || [], [usersState.data]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
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
      const searchToUse = searchTerm || globalSearchTerm;
      const matchesSearch = !searchToUse || 
                           user.name.toLowerCase().includes(searchToUse.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchToUse.toLowerCase());
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, globalSearchTerm, filterRole, filterStatus]);
  
  // Reset search when input is cleared
  useEffect(() => {
    if (searchTerm === '') {
      setActiveSearch('');
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(searchTerm);
  };
  
  const availableStatuses = statuses;

  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setModalType('view');
    setShowModal(true);
    
    try {
      setIsDetailLoading(true);
      const data = await getUserDetail(user.id);
      setUserDetail(data);
    } catch (err) {
      setUiError("Erreur lors du chargement des détails");
    } finally {
      setIsDetailLoading(false);
    }
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

  const ProfileDetail = ({ label, value, icon }) => (
    <div className="space-y-1">
      <div className="flex items-center text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">
        {icon && <span className="mr-1.5 opacity-50">{icon}</span>}
        {label}
      </div>
      <p className="text-sm font-bold text-surface-900">{value || '—'}</p>
    </div>
  );

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
            <p className="text-gray-400 mt-2">Gérer les comptes utilisateurs et leurs permissions</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Nouveau Utilisateur</span>
          </Button>
        </div>
        
        {/* Filters and Search */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher en temps réel par nom ou email..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <select
                className="w-full py-2.5 px-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
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
                className="w-full py-2.5 px-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {availableStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
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
        onClose={() => {
          setShowModal(false);
          setUserDetail(null);
        }} 
        title="Détails de l'utilisateur"
        size="xl"
      >
        {isDetailLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-surface-400 font-medium uppercase tracking-widest text-xs">Chargement du profil...</p>
          </div>
        ) : userDetail ? (
          <div className="space-y-8">
            {/* Header Profil */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-surface-100">
              <div className="h-24 w-24 rounded-[2rem] bg-primary-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-primary-500/20 overflow-hidden shrink-0">
                {userDetail.profile_picture ? (
                  <img src={`${import.meta.env.VITE_API_URL}/storage/${userDetail.profile_picture}`} alt="" className="h-full w-full object-cover" />
                ) : (
                  userDetail.nom[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-black text-surface-900 tracking-tight truncate">{userDetail.nom}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-100 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    <span>{userDetail.role?.code || 'Sans rôle'}</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    userDetail.actif 
                    ? 'bg-green-50 text-green-600 border-green-100' 
                    : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    <span>{userDetail.actif ? 'Actif' : 'Inactif'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-surface-400 text-xs font-medium ml-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{userDetail.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Informations Professionnelles */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] flex items-center">
                  <IdentificationIcon className="h-4 w-4 mr-2" />
                  Détails Professionnels
                </h3>
                
                {userDetail.employe ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-50 p-6 rounded-3xl border border-surface-100">
                    <ProfileDetail label="Matricule" value={userDetail.employe.matricule} icon={<IdentificationIcon className="h-4 w-4" />} />
                    <ProfileDetail label="CIN" value={userDetail.employe.cin} icon={<IdentificationIcon className="h-4 w-4" />} />
                    <ProfileDetail label="Grade" value={userDetail.employe.grade?.libelle} icon={<AcademicCapIcon className="h-4 w-4" />} />
                    <ProfileDetail label="Région" value={userDetail.employe.region?.libelle} icon={<MapPinIcon className="h-4 w-4" />} />
                    <ProfileDetail label="Établissement" value={userDetail.employe.etablissement?.nom} icon={<BuildingOfficeIcon className="h-4 w-4" />} />
                    <ProfileDetail label="Recrutement" value={userDetail.employe.date_recrutement ? new Date(userDetail.employe.date_recrutement).toLocaleDateString('fr-FR') : '—'} icon={<CalendarIcon className="h-4 w-4" />} />
                  </div>
                ) : (
                  <div className="p-10 text-center bg-surface-50 rounded-3xl border border-dashed border-surface-200">
                    <p className="text-surface-400 text-sm font-medium italic">Aucune information professionnelle renseignée</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] flex items-center">
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  Documents de support
                </h3>
                
                <div className="space-y-3">
                  {userDetail.documents && userDetail.documents.length > 0 ? (
                    userDetail.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-2xl hover:border-primary-300 transition-all group">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="p-2 bg-primary-50 rounded-xl text-primary-600 group-hover:scale-110 transition-transform">
                            <DocumentIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-surface-900 truncate">{doc.title}</p>
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter">{doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <a 
                          href={`${import.meta.env.VITE_API_URL}/storage/${doc.file_path}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center bg-surface-50 rounded-3xl border border-dashed border-surface-200">
                      <p className="text-surface-400 text-sm font-medium italic">Aucun document téléchargé</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Administrateur */}
            <div className="pt-8 border-t border-surface-100">
              <div className="bg-primary-50/50 border border-primary-100 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-primary-900 uppercase tracking-widest">Attribution de Rôle</h4>
                  <p className="text-xs text-primary-700/70 font-medium">Assignez un rôle approprié basé sur le profil de l'utilisateur.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setSelectedUser(userDetail);
                        setFormData({
                          ...formData,
                          name: userDetail.nom,
                          email: userDetail.email,
                          role: r.value,
                          status: userDetail.actif ? 'actif' : 'inactif'
                        });
                        setModalType('edit');
                      }}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                        userDetail.role?.code.toLowerCase() === r.value.toLowerCase()
                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                        : 'bg-white text-surface-600 border-surface-200 hover:border-primary-400 hover:text-primary-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="px-10 rounded-2xl py-4 uppercase tracking-widest text-[10px] font-black">
                Fermer
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
      
      {/* Edit User Modal */}
      <Modal 
        isOpen={showModal && modalType === 'edit'} 
        onClose={() => setShowModal(false)} 
        title="Modifier l'utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                >
                  {availableStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t border-surface-100">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="px-8 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveUser} className="px-8 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
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
