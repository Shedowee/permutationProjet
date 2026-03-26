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
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { fetchUsers } from '../redux/adminSlice';
import { listRoles } from '../../../services/adminService';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';

const AssignRoles = () => {
  const dispatch = useDispatch();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const users = useSelector(state => state.admin.users.data) || [];
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);

  // Filtrer les utilisateurs selon la recherche globale
  const filteredUsers = React.useMemo(() => {
    if (!globalSearchTerm) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [users, globalSearchTerm]);
  
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

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setErrorMessage('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = users.find(u => u.id.toString() === selectedUser);
      if (user) {
        const newAssignment = {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          newRole: selectedRole,
          assignedAt: new Date().toLocaleString('fr-FR')
        };
        
        setAssignedUsers(prev => [...prev, newAssignment]);
        setSuccessMessage(`Rôle "${selectedRole}" assigné à ${user.name} avec succès !`);
        setErrorMessage('');
        
        // Reset selections
        setSelectedUser('');
        setSelectedRole('');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      setErrorMessage("Une erreur s'est produite lors de l'attribution du rôle.");
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
            <div className="p-4 bg-white rounded-[1.5rem] shadow-sm border border-surface-100">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Assignment Card */}
          <Card className="p-8 bg-white rounded-[2rem] border border-surface-100 shadow-sm">
            <h2 className="text-xs font-black text-surface-900 uppercase tracking-[0.2em] mb-8 flex items-center border-b border-surface-50 pb-4">
              <KeyIcon className="w-5 h-5 mr-3 text-primary-500" />
              Nouvelle Attribution
            </h2>
            
            <div className="space-y-8">
              {successMessage && (
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between animate-slideUp">
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
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between animate-slideUp">
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
                    className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionnez un utilisateur</option>
                    {filteredUsers.map(user => (
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
                    className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
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
              
              {selectedUser && selectedRole && (
                <div className="p-6 rounded-2xl bg-primary-50/50 border border-primary-100 space-y-4 animate-slideUp">
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
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  variant="primary" 
                  className="w-full py-4 rounded-2xl shadow-xl shadow-primary-500/20 flex items-center justify-center group"
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
          <Card className="p-8 bg-white rounded-[2rem] border border-surface-100 shadow-sm flex flex-col">
            <h2 className="text-xs font-black text-surface-900 uppercase tracking-[0.2em] mb-8 flex items-center border-b border-surface-50 pb-4">
              <UserIcon className="w-5 h-5 mr-3 text-secondary-500" />
              Assignations récentes
            </h2>
            
            {assignedUsers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-8 h-8 text-surface-300" />
                </div>
                <p className="text-xs font-black text-surface-600 uppercase tracking-widest">Aucune attribution récente</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {assignedUsers.map((assignment, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="p-5 rounded-2xl bg-surface-50 border border-surface-100 group hover:border-primary-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-black text-surface-900 text-sm uppercase tracking-tight">{assignment.userName}</h4>
                          <p className="text-[10px] font-bold text-surface-600 uppercase tracking-widest">{assignment.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary-50 text-secondary-600 border border-secondary-100">
                            {assignment.newRole}
                          </span>
                          <span className="text-[9px] font-bold text-surface-500 uppercase tracking-tighter">
                            {assignment.assignedAt}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveAssignment(assignment.userId)}
                        className="p-2.5 rounded-xl bg-white border border-surface-200 text-surface-500 hover:text-rose-600 hover:border-rose-200 hover:shadow-sm transition-all"
                        title="Retirer l'attribution"
                      >
                        <ExclamationCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        {/* Users List Card */}
        <Card className="p-8 bg-white rounded-[2rem] border border-surface-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-surface-50 pb-4">
            <h2 className="text-xs font-black text-surface-900 uppercase tracking-[0.2em] flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-3 text-primary-500" />
              Liste des Utilisateurs
            </h2>
            <span className="px-3 py-1 bg-surface-50 text-surface-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-surface-100">
              {users.length} Total
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user.id} 
                className="p-6 rounded-2xl bg-surface-50 border border-surface-100 hover:border-primary-200 hover:shadow-soft transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-surface-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-sm">
                    <UserIcon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-surface-900 text-sm uppercase tracking-tight truncate">{user.name}</h4>
                    <p className="text-[10px] font-bold text-surface-600 uppercase tracking-widest truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-50 text-primary-600 border border-primary-100">
                    {user.role}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.status === 'actif' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                    user.status === 'bloque' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AssignRoles;
