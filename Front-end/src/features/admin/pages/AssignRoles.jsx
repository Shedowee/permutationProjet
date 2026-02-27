import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { KeyIcon, UserIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Attribution des Rôles</h1>
          <p className="text-gray-400 mt-2">Gérer les rôles et permissions des utilisateurs</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Assignment Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <KeyIcon className="w-5 h-5 mr-2 text-purple-400" />
              Attribution de rôle
            </h2>
            
            <div className="space-y-6">
              {successMessage && (
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-green-400">{successMessage}</span>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="text-green-300/80 hover:text-green-200 transition-colors"
                    aria-label="Fermer la notification de succès"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-between">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3" />
                    <span className="text-red-300">{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="text-red-300/80 hover:text-red-200 transition-colors"
                    aria-label="Fermer la notification d'erreur"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Sélectionner un utilisateur
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Sélectionnez un utilisateur</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Sélectionner un rôle
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Sélectionnez un rôle</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              {selectedUser && selectedRole && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">Résumé de l'attribution</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">
                      <span className="font-medium text-white">Utilisateur:</span> {users.find(u => u.id.toString() === selectedUser)?.name}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">Email:</span> {users.find(u => u.id.toString() === selectedUser)?.email}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">Nouveau rôle:</span> {selectedRole}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  variant="primary" 
                  className="w-full md:w-auto flex items-center"
                  onClick={handleAssignRole}
                  disabled={!selectedUser || !selectedRole || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Attribution en cours...
                    </>
                  ) : (
                    <>
                      <KeyIcon className="w-5 h-5 mr-2" />
                      Assigner le rôle
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Recent Assignments Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-green-400" />
              Assignations récentes
            </h2>
            
            {assignedUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Aucune attribution de rôle récente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedUsers.map((assignment, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/5 border border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{assignment.userName}</h4>
                        <p className="text-sm text-gray-400">{assignment.userEmail}</p>
                        <div className="mt-2 flex items-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {assignment.newRole}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Assigné le: {assignment.assignedAt}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveAssignment(assignment.userId)}
                        className="ml-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors duration-200"
                        title="Retirer l'attribution"
                      >
                        <ExclamationCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        {/* Users List Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Liste des utilisateurs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.id} className="p-4 rounded-lg bg-white/5 border border-gray-700/50">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center mr-3">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{user.name}</h4>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'actif' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    user.status === 'bloque' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AssignRoles;
