import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import CreateUserForm from '../components/CreateUserForm';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  IdentificationIcon,
  AcademicCapIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  DocumentIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { fetchUsers, selectUsersMeta, createUser, updateUser, deleteUser } from '../redux/adminSlice';
import { listRoles } from '../../../services/adminService';
import { listUserStatuses } from '../../../services/paramService';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';
import { getUserDetail } from '../../../services/usersService';

const UserManagement = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const usersState = useSelector(state => state.admin.users) || { data: [], meta: null, loading: false, error: null };
  const users = useMemo(() => usersState.data || [], [usersState.data]);
  const meta = useSelector(selectUsersMeta);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [uiSuccess, setUiSuccess] = useState('');
  const [uiError, setUiError] = useState('');

  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const focusUserId = searchParams.get('user');
  const pendingOnly = searchParams.get('pending') === '1' || searchParams.get('pending') === 'true';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    role: '',
    status: '',
    specialite: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    dispatch(fetchUsers({
      page: currentPage,
      limit: pageSize,
      filters: {
        search: searchTerm || globalSearchTerm,
        role: filterRole,
        status: filterStatus,
        pending: pendingOnly ? 1 : 0,
      }
    }));
  }, [dispatch, currentPage, searchTerm, globalSearchTerm, filterRole, filterStatus, pendingOnly]);

  useEffect(() => {
    // Fetch roles
    (async () => {
      try {
        const data = await listRoles();
        setRoles(data);
      } catch {
        setRoles([]);
      }
    })();

    // Fetch statuses
    (async () => {
      try {
        const data = await listUserStatuses();
        const mergedStatuses = [
          { value: 'pending', label: 'En attente' },
          ...(data || []).filter((status) => String(status.value).toLowerCase() !== 'pending'),
        ];
        setStatuses(mergedStatuses.length ? mergedStatuses : [
          { value: 'pending', label: 'En attente' },
          { value: 'active', label: 'Actif' },
          { value: 'inactive', label: 'Inactif' },
          { value: 'blocked', label: 'Bloqué' },
        ]);
      } catch {
        setStatuses([
          { value: 'pending', label: 'En attente' },
          { value: 'active', label: 'Actif' },
          { value: 'inactive', label: 'Inactif' },
          { value: 'blocked', label: 'Bloqué' },
        ]);
      }
    })();
  }, [dispatch]);

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

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, globalSearchTerm, filterRole, filterStatus]);

  useEffect(() => {
    if (!focusUserId || isDetailLoading) {
      return;
    }

    let cancelled = false;

    const openFocusedUser = async () => {
      setIsDetailLoading(true);
      try {
        const data = await getUserDetail(focusUserId);
        if (cancelled) {
          return;
        }

        setSelectedUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          phone: data.phone,
          age: data.age,
          address: data.address,
          specialite: data.formateur?.specialite || '',
          dateCreated: data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR') : '',
          lastLogin: data.logs?.[0]?.date || '',
        });
        setUserDetail(data);
        setModalType('view');
        setShowModal(true);
      } catch {
        setUiError("Erreur lors du chargement des détails");
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false);
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('user');
          setSearchParams(nextParams, { replace: true });
        }
      }
    };

    openFocusedUser();

    return () => {
      cancelled = true;
    };
  }, [focusUserId, isDetailLoading, searchParams, setSearchParams]);

  const paginatedUsers = useMemo(() => {
    return users; // Backend already handles pagination and filtering
  }, [users]);

  const totalItems = meta?.total || 0;
  const totalPages = meta?.last_page || 1;

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setModalType('view');
    setShowModal(true);
    setIsDetailLoading(true);
    try {
      const data = await getUserDetail(user.id);
      setSelectedUser(prev => ({
        ...prev,
        specialite: data.formateur?.specialite || prev?.specialite || ''
      }));
      setUserDetail(data);
    } catch {
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
      age: user.age || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      status: user.status,
      specialite: userDetail?.formateur?.specialite || user.specialite || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
  };

  const handleValidateUser = (user) => {
    dispatch(updateUser({ id: user.id, userData: { status: 'active' } }))
      .unwrap()
      .then(() => {
        setUiSuccess('Utilisateur validé');
        dispatch(fetchUsers({
          page: currentPage,
          limit: pageSize,
          filters: {
            search: searchTerm || globalSearchTerm,
            role: filterRole,
            status: filterStatus,
            pending: pendingOnly ? 1 : 0,
          }
        }));
      })
      .catch(err => setUiError(err));
  };

  const handleConfirmDelete = () => {
    dispatch(deleteUser(selectedUser.id))
      .unwrap()
      .then(() => setUiSuccess('Utilisateur supprimé'))
      .catch(err => setUiError(err))
      .finally(() => {
        setShowModal(false);
        setSelectedUser(null);
      });
  };

  const handleSaveUser = () => {
    dispatch(updateUser({ id: selectedUser.id, userData: formData }))
      .unwrap()
      .then(() => setUiSuccess('Utilisateur mis à jour'))
      .catch(err => setUiError(err))
      .finally(() => {
        setShowModal(false);
        setSelectedUser(null);
      });
  };

  const handleCreateUser = (newUserData) => {
    dispatch(createUser(newUserData))
      .unwrap()
      .then(() => setUiSuccess('Utilisateur créé'))
      .catch(err => setUiError(err))
      .finally(() => setShowCreateModal(false));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const ProfileDetail = ({ label, value, icon }) => (
    <div className="space-y-1">
      <div className="flex items-center text-[10px] font-black text-jb-text-muted uppercase tracking-widest mb-1">
        {icon && <span className="mr-1.5 opacity-50">{icon}</span>}
        {label}
      </div>
      <p className="text-sm font-bold text-jb-text-primary">{value || '—'}</p>
    </div>
  );

  const columns = [
    {
      header: 'Utilisateur',
      key: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-jb-bg-elevated flex items-center justify-center text-jb-text-primary text-xs font-black border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10">
            {value.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-jb-text-primary text-sm uppercase tracking-tight">{value}</span>
            <span className="text-jb-text-muted text-[10px] lowercase">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Rôle',
      key: 'role',
      render: (value) => {
        const roleLabel = roles.find(r => r.value === value)?.label || value;
        return (
          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-jb-bg-elevated text-jb-purple border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10">
            {roleLabel}
          </span>
        );
      }
    },
    {
      header: 'Statut',
      key: 'status',
      render: (value) => {
        const isActif = value === 'active';
        const isBlocked = value === 'blocked';
        const cls = isActif ? 'text-jb-green bg-jb-green/5 border-jb-green/20' : isBlocked ? 'text-jb-red bg-jb-red/5 border-jb-red/20' : 'text-jb-orange bg-jb-orange/5 border-jb-orange/20';
        return (
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isActif ? 'bg-jb-green animate-pulse' : 'bg-jb-text-muted'}`}></div>
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cls}`}>
              {value}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {String(row.status).toLowerCase() !== 'active' && (
            <button onClick={() => handleValidateUser(row)} className="p-2 rounded-lg bg-jb-bg-elevated border-2 border-jb-green/20 text-jb-text-muted hover:text-jb-green hover:border-jb-green/40 transition-all" title="Valider">
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleViewUser(row)} className="p-2 rounded-lg bg-jb-bg-elevated border-2 border-jb-cyan/20 text-jb-text-muted hover:text-jb-cyan hover:border-jb-cyan/40 transition-all">
            <EyeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleEditUser(row)} className="p-2 rounded-lg bg-jb-bg-elevated border-2 border-jb-green/20 text-jb-text-muted hover:text-jb-blue hover:border-jb-blue/40 transition-all">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteUser(row)} className="p-2 rounded-lg bg-jb-bg-elevated border-2 border-jb-cyan/20 text-jb-text-muted hover:text-jb-red hover:border-jb-red/40 transition-all">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-jb-text-primary tracking-tighter uppercase">Gestion Utilisateurs</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 bg-jb-gradient-primary rounded-full"></span>
              <p className="text-jb-text-muted font-bold uppercase tracking-[0.2em] text-[10px]">Administration des comptes et accès</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-jb-gradient-primary border-none shadow-primary px-8 py-4 rounded-lg flex items-center gap-3 group"
            icon={UserPlusIcon}
          >
            <span className="text-sm font-black uppercase tracking-widest">Nouveau Utilisateur</span>
          </Button>
        </div>

        {/* Success/Error Alerts */}
        <div className="space-y-4">
          {uiSuccess && (
            <div className="bg-jb-green/10 border border-jb-green/20 p-4 rounded-lg flex items-center gap-3 animate-slide-in">
              <CheckCircleIcon className="w-5 h-5 text-jb-green" />
              <p className="text-xs font-black text-jb-green uppercase tracking-widest">{uiSuccess}</p>
            </div>
          )}
          {uiError && (
            <div className="bg-jb-red/10 border border-jb-red/20 p-4 rounded-lg flex items-center gap-3 animate-slide-in">
              <ExclamationTriangleIcon className="w-5 h-5 text-jb-red" />
              <p className="text-xs font-black text-jb-red uppercase tracking-widest">{uiError}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Panel */}
          <Card className="lg:col-span-1 bg-jb-bg-section border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 rounded-lg p-8 h-fit sticky top-24">
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-jb-cyan/15 pb-4">
                <FunnelIcon className="w-5 h-5 text-jb-blue" />
                <h2 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Filtres de recherche</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Recherche globale</label>
                  <div className="relative group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-jb-text-muted group-focus-within:text-jb-cyan transition-colors" />
                    <input
                      type="text"
                      placeholder="Nom, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl pl-10 pr-4 py-3 text-jb-text-primary text-xs font-bold focus:border-jb-cyan outline-none transition-all placeholder:text-jb-text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Par Rôle</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full bg-jb-bg-main border-2 border-jb-cyan/20 rounded-xl px-4 py-3 text-jb-text-secondary text-xs font-bold focus:border-jb-purple outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Tous les rôles</option>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Par Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl px-4 py-3 text-jb-text-secondary text-xs font-bold focus:border-jb-orange outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Tous les statuts</option>
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {setSearchTerm(''); setFilterRole(''); setFilterStatus('');}}
                  className="w-full text-jb-text-muted hover:text-jb-text-primary text-[9px] font-black uppercase tracking-widest"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </Card>

          {/* Table Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Card noPadding className="bg-jb-bg-section border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10 rounded-lg overflow-hidden shadow-hard">
              <Table
                columns={columns}
                data={paginatedUsers}
                isLoading={usersState.loading}
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems,
                  onPageChange: setCurrentPage
                }}
                emptyMessage="Aucun utilisateur ne correspond à vos critères"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={showModal && modalType === 'view'} onClose={() => setShowModal(false)} title="Profil Utilisateur" size="xl">
        {isDetailLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-jb-border border-t-jb-cyan rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest">Récupération des données...</p>
          </div>
        ) : selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
              <div className="flex items-center gap-6 p-6 bg-jb-bg-main rounded-lg border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-standard">
                  <IdentificationIcon className="w-40 h-40 text-jb-cyan" />
                </div>
                <div className="w-20 h-20 rounded-lg bg-jb-gradient-primary flex items-center justify-center text-white text-3xl font-black shadow-primary relative z-10 shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="relative z-10 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jb-text-muted">Profil utilisateur</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-jb-text-primary uppercase tracking-tighter truncate">{selectedUser.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-jb-text-secondary font-medium text-sm lowercase truncate">{selectedUser.email}</span>
                    <span className="w-1 h-1 rounded-full bg-jb-border"></span>
                    <span className="px-3 py-1 rounded-lg bg-jb-bg-elevated text-jb-cyan text-[9px] font-black uppercase tracking-widest border border-jb-cyan/20">{selectedUser.role}</span>
                    <span className="px-3 py-1 rounded-lg bg-jb-bg-main text-jb-text-primary text-[9px] font-black uppercase tracking-widest border-2 border-jb-cyan/20">{selectedUser.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ProfileDetail label="Statut de compte" value={selectedUser.status} icon={<CheckCircleIcon className="w-3.5 h-3.5" />} />
                <ProfileDetail label="Inscription" value={selectedUser.dateCreated || "—"} icon={<CalendarIcon className="w-3.5 h-3.5" />} />
                <ProfileDetail label="Dernière activité" value={selectedUser.lastLogin || "Jamais connecté"} icon={<ClockIcon className="w-3.5 h-3.5" />} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-jb-green/15 pb-3">
                  <IdentificationIcon className="w-5 h-5 text-jb-cyan" />
                  <h4 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Profil & Contact</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <ProfileDetail label="Nom complet" value={userDetail?.name || selectedUser.name} icon={<IdentificationIcon className="w-3.5 h-3.5" />} />
                  <ProfileDetail label="Téléphone" value={userDetail?.phone} icon={<EnvelopeIcon className="w-3.5 h-3.5" />} />
                  <ProfileDetail label="Âge" value={userDetail?.age} icon={<CalendarIcon className="w-3.5 h-3.5" />} />
                  <ProfileDetail label="Adresse" value={userDetail?.address} icon={<MapPinIcon className="w-3.5 h-3.5" />} />
                </div>
              </div>

              <div className="space-y-4">
                {userDetail?.admin && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b-2 border-jb-cyan/15 pb-3">
                      <ShieldCheckIcon className="w-5 h-5 text-jb-red" />
                      <h4 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Profil Administrateur</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <ProfileDetail label="Niveau admin" value={userDetail.admin.admin_level} icon={<ShieldCheckIcon className="w-3.5 h-3.5" />} />
                      <ProfileDetail label="Notes" value={userDetail.admin.notes} icon={<IdentificationIcon className="w-3.5 h-3.5" />} />
                      <ProfileDetail
                        label="Métadonnées"
                        value={userDetail.admin.metadata ? JSON.stringify(userDetail.admin.metadata) : '—'}
                        icon={<DocumentIcon className="w-3.5 h-3.5" />}
                      />
                    </div>
                  </div>
                )}

                {userDetail?.commission && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b-2 border-jb-green/15 pb-3">
                      <ShieldCheckIcon className="w-5 h-5 text-jb-orange" />
                      <h4 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Profil Commission</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <ProfileDetail label="Nom commission" value={userDetail.commission.commission_name} icon={<IdentificationIcon className="w-3.5 h-3.5" />} />
                      <ProfileDetail label="Période" value={`${userDetail.commission.start_date || '—'} / ${userDetail.commission.end_date || '—'}`} icon={<CalendarIcon className="w-3.5 h-3.5" />} />
                      <ProfileDetail label="Notes" value={userDetail.commission.notes} icon={<IdentificationIcon className="w-3.5 h-3.5" />} />
                    </div>
                  </div>
                )}

                {userDetail?.formateur && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b-2 border-jb-cyan/15 pb-3">
                      <BuildingOffice2Icon className="w-5 h-5 text-jb-blue" />
                      <h4 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Affiliation Professionnelle</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <ProfileDetail label="Établissement" value={userDetail.formateur.etablissement?.name} icon={<BuildingOffice2Icon className="w-3.5 h-3.5" />} />
                      <ProfileDetail label="Matricule" value={userDetail.formateur.employee_number} icon={<AcademicCapIcon className="w-3.5 h-3.5" />} />
                      <ProfileDetail label="Spécialité" value={userDetail.formateur.specialite} icon={<DocumentIcon className="w-3.5 h-3.5" />} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-jb-green/20">
              <Button onClick={() => setShowModal(false)} className="bg-jb-bg-elevated border-2 border-jb-cyan/20 text-jb-text-primary hover:bg-jb-bg-main px-8 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showModal && modalType === 'edit'} onClose={() => setShowModal(false)} title="Modifier Utilisateur" size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Nom Complet</label>
              <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-blue outline-none transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Email Professionnel</label>
              <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-cyan/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-blue outline-none transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Téléphone</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-blue outline-none transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Âge</label>
              <input name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-cyan/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-blue outline-none transition-all" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Adresse</label>
              <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-blue outline-none transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Rôle Système</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-cyan/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-purple outline-none transition-all appearance-none cursor-pointer">
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {formData.role === 'formateur' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Spécialité</label>
                <input
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-blue outline-none transition-all"
                  placeholder="Ex: Génie logiciel"
                />
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Statut Actuel</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-jb-bg-main border-2 border-jb-green/20 rounded-xl px-4 py-3 text-jb-text-primary text-sm font-bold focus:border-jb-orange outline-none transition-all appearance-none cursor-pointer">
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-5 border-t-2 border-jb-cyan/15">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="text-jb-text-muted hover:text-jb-text-primary text-[10px] font-black uppercase tracking-widest">Annuler</Button>
            <Button onClick={handleSaveUser} className="bg-jb-blue hover:bg-jb-blue/80 text-white shadow-soft px-10 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">Enregistrer les modifications</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showModal && modalType === 'delete'} onClose={() => setShowModal(false)} title="Confirmation de Suppression" size="md">
        <div className="space-y-6 py-2 text-center">
          <div className="w-20 h-20 bg-jb-red/10 rounded-lg border border-jb-red/20 flex items-center justify-center text-jb-red mx-auto shadow-lg shadow-jb-red/5">
            <TrashIcon className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-black text-jb-text-primary uppercase tracking-tighter">Action irréversible</h3>
            <p className="text-jb-text-secondary leading-relaxed max-w-sm mx-auto">
              Vous êtes sur le point de supprimer le compte de <span className="text-jb-text-primary font-black uppercase tracking-widest bg-jb-bg-elevated px-2 py-1 rounded-lg">"{selectedUser?.name}"</span>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1 text-jb-text-muted hover:text-jb-text-primary font-black uppercase tracking-widest text-[10px]">Abandonner</Button>
            <Button onClick={handleConfirmDelete} className="flex-1 bg-jb-red hover:bg-jb-red/80 text-white shadow-hard font-black uppercase tracking-widest text-[10px] py-3 rounded-lg">Supprimer définitivement</Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nouvel Utilisateur" size="lg">
        <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </Layout>
  );
};

export default UserManagement;
