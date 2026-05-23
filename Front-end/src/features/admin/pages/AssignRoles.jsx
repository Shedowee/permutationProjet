import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { 
  KeyIcon, 
  UserIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { fetchUsers, updateUser } from '../redux/adminSlice';
import { listPermissions, listRoles, updateRolePermissions } from '../../../services/adminService';

const AssignRoles = () => {
  const dispatch = useDispatch();
  const users = useSelector(state => state.admin.users.data) || [];
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionsDirty, setPermissionsDirty] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUsers({ limit: -1 }));
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const [rolesData, permissionsData] = await Promise.all([
          listRoles(),
          listPermissions(),
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch {
        setRoles([]);
        setPermissions([]);
      }
    })();
  }, []);

  useEffect(() => {
    const role = roles.find((item) => item.value === selectedRole);
    setRolePermissions(role?.permissions || []);
    setPermissionsDirty(false);
  }, [selectedRole, roles]);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setErrorMessage('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call actual API via Redux thunk
      await dispatch(updateUser({ 
        id: selectedUser, 
        userData: { role: selectedRole } 
      })).unwrap();
      
      const user = users.find(u => u.id.toString() === selectedUser);
      if (user) {
        const newAssignment = {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          newRole: selectedRole,
          assignedAt: new Date().toLocaleString('fr-FR')
        };
        
        setAssignedUsers(prev => [newAssignment, ...prev]);
        setSuccessMessage(`Rôle "${selectedRole}" assigné à ${user.name} avec succès !`);
        setErrorMessage('');
        
        // Reset selections
        setSelectedUser('');
        setSelectedRole('');

        // Refresh users list from server
        dispatch(fetchUsers({ limit: -1 }));
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      setErrorMessage(error || "Une erreur s'est produite lors de l'attribution du rôle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionName) => {
    setRolePermissions((current) => {
      const next = current.includes(permissionName)
        ? current.filter((name) => name !== permissionName)
        : [...current, permissionName];
      return next;
    });
    setPermissionsDirty(true);
  };

  const handleSavePermissions = async () => {
    const role = roles.find((item) => item.value === selectedRole);
    if (!role) {
      setErrorMessage('Veuillez sélectionner un rôle.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateRolePermissions(role.id, rolePermissions);
      setRoles((current) =>
        current.map((item) =>
          item.id === role.id
            ? { ...item, permissions: updated?.permissions?.map((p) => p.name) || rolePermissions }
            : item
        )
      );
      setSuccessMessage(`Permissions du rôle "${role.label}" mises à jour avec succès !`);
      setErrorMessage('');
      setPermissionsDirty(false);
    } catch (err) {
      console.error('Error updating permissions:', err);
      setErrorMessage(err.response?.data?.message || "Impossible de mettre à jour les permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = (userId) => {
    setAssignedUsers(prev => prev.filter(assignment => assignment.userId !== userId));
  };

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white rounded-lg shadow-[0_22px_46px_-26px_rgba(15,159,181,0.28)] border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10">
              <KeyIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Administration</span>
              </div>
              <h1 className="text-3xl font-black text-surface-900 tracking-tight">Attribution des <span className="text-primary-600">Rôles</span></h1>
              <p className="text-surface-600 text-sm font-bold">Gérer les accès et permissions des utilisateurs</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Role Assignment Card */}
          <Card className="lg:col-span-7 p-8 lg:p-10 bg-white rounded-lg border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 shadow-[0_30px_72px_-42px_rgba(12,122,59,0.28)]">
            <h2 className="text-xs font-black text-surface-900 uppercase tracking-[0.2em] mb-8 flex items-center border-b-2 border-jb-green/15 pb-4">
              <KeyIcon className="w-5 h-5 mr-3 text-primary-500" />
              Nouvelle Attribution
            </h2>
            
            <div className="space-y-8">
              {successMessage && (
                <div className="p-5 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-between animate-slideUp">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-teal-600 mr-3" />
                    <span className="text-xs font-black text-teal-700 uppercase tracking-widest">{successMessage}</span>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="text-teal-400 hover:text-teal-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {errorMessage && (
                <div className="p-5 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-between animate-slideUp">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 mr-3" />
                    <span className="text-xs font-black text-rose-700 uppercase tracking-widest">{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 mb-3 block">
                  Sélectionner un utilisateur
                </label>
                <div className="relative group">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-surface-50 border-2 border-jb-green/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionnez un utilisateur</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id.toString()}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-surface-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 mb-3 block">
                  Sélectionner un rôle
                </label>
                <div className="relative group">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-surface-50 border-2 border-jb-cyan/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-surface-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {selectedRole && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1">
                      Permissions du rôle
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSavePermissions}
                      disabled={!permissionsDirty || isSubmitting}
                      className="px-4"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                    {permissions.map((permission) => {
                      const checked = rolePermissions.includes(permission.name);
                      return (
                        <button
                          key={permission.id}
                          type="button"
                          onClick={() => togglePermission(permission.name)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            checked
                              ? 'bg-primary-50 border-primary-200 shadow-[0_14px_28px_-18px_rgba(47,123,229,0.2)]'
                              : 'bg-white border-2 border-jb-green/20 hover:border-primary-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center ${
                              checked ? 'bg-primary-500 border-primary-500 text-white' : 'border-2 border-jb-cyan/20'
                            }`}>
                              {checked && <CheckIcon className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-surface-900">{permission.name}</p>
                              <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-1">
                                {permission.description || 'Aucune description'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedUser && selectedRole && (
                <div className="p-6 rounded-lg bg-primary-50/50 border border-primary-100 space-y-4 animate-slideUp">
                  <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Résumé de l'attribution
                  </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Utilisateur</span>
                  <span className="text-sm font-bold text-surface-900">{users.find(u => u.id.toString() === selectedUser)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Nouveau rôle</span>
                  <span className="px-3 py-1 bg-primary-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{selectedRole}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Permissions associées</span>
                  <div className="flex flex-wrap gap-2">
                    {(rolePermissions || []).map((permission) => (
                      <span key={permission} className="px-2.5 py-1 rounded-full bg-surface-100 text-surface-700 text-[9px] font-black uppercase tracking-widest border-2 border-jb-green/20">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
              
              <div className="pt-4">
                <Button 
                  variant="primary" 
                  className="w-full py-4 rounded-lg shadow-[0_24px_50px_-28px_rgba(47,123,229,0.3)] flex items-center justify-center group"
                  onClick={handleAssignRole}
                  disabled={!selectedUser || !selectedRole || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      <span className="font-black uppercase tracking-widest text-[10px]">Attribution...</span>
                    </div>
                  ) : (
                    <>
                      <KeyIcon className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Assigner le rôle</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Recent Assignments Card */}
          <Card className="lg:col-span-3 p-4 lg:p-5 bg-white rounded-lg border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10 shadow-[0_28px_64px_-38px_rgba(15,159,181,0.28)] flex flex-col h-fit">
            <h2 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.22em] mb-4 flex items-center border-b-2 border-jb-cyan/15 pb-2">
              <UserIcon className="w-4 h-4 mr-2 text-secondary-500" />
              Assignations récentes
            </h2>
            
            {assignedUsers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 bg-surface-50 rounded-full flex items-center justify-center mb-3">
                  <UserIcon className="w-7 h-7 text-surface-300" />
                </div>
                <p className="text-xs font-black text-surface-600 uppercase tracking-widest">Aucune attribution récente</p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {assignedUsers.map((assignment, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="p-3.5 rounded-lg bg-surface-50 border-2 border-jb-green/20 group hover:border-primary-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2.5">
                        <div>
                          <h4 className="font-black text-surface-900 text-[11px] uppercase tracking-tight">{assignment.userName}</h4>
                          <p className="text-[9px] font-bold text-surface-600 uppercase tracking-widest">{assignment.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-secondary-50 text-secondary-600 border-2 border-jb-cyan/20">
                            {assignment.newRole}
                          </span>
                          <span className="text-[8px] font-bold text-surface-500 uppercase tracking-tighter">
                            {assignment.assignedAt}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveAssignment(assignment.userId)}
                        className="p-2 rounded-xl bg-white border-2 border-jb-cyan/20 text-surface-500 hover:text-rose-600 hover:border-rose-200 hover:shadow-[0_14px_26px_-16px_rgba(244,63,94,0.2)] transition-all"
                        title="Retirer l'attribution"
                      >
                        <ExclamationCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AssignRoles;
