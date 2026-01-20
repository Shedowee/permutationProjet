import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { listRoles } from '../../../services/adminService';
import { listUsers, updateUser } from '../../../services/usersService';
import { useToast } from '../../../shared/context/useToast';
import { UserGroupIcon, ShieldCheckIcon, CheckCircleIcon, ExclamationTriangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const AssignRoles = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [r, u] = await Promise.all([listRoles(), listUsers()]);
        setRoles(r);
        setUsers(u);
      } catch {
        setRoles([]);
        setUsers([]);
      }
    })();
  }, []);

  // Find selected user
  const selectedUser = useMemo(() => {
    return users.find(user => user.id.toString() === selectedUserId);
  }, [users, selectedUserId]);

  const handleAssignRole = async () => {
    setIsLoading(true);
    
    try {
      const updated = await updateUser({ id: selectedUserId, role: selectedRole });
      success(`Rôle ${roles.find(r => r.value === selectedRole)?.label || selectedRole} attribué à ${updated.name} avec succès`);
      setSuccessMessage(`Rôle ${roles.find(r => r.value === selectedRole)?.label || selectedRole} attribué à ${updated.name} avec succès !`);
      setSelectedUserId('');
      setSelectedRole('');
      setShowConfirmation(false);
    } catch {
      error("Une erreur s'est produite lors de l'attribution du rôle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedUserId && selectedRole) {
      setShowConfirmation(true);
    }
  };

  const handleReset = () => {
    setSelectedUserId('');
    setSelectedRole('');
    setSuccessMessage('');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Attribution des Rôles</h1>
          <p className="text-gray-400 mt-2">Attribuez des rôles spécifiques aux utilisateurs</p>
        </div>
        
        <Card className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-green-400">{successMessage}</span>
            </div>
          )}
          
          <div className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-2 text-blue-400" />
                Sélectionner un utilisateur
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  if (successMessage) setSuccessMessage('');
                }}
                className="w-full rounded-lg border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
              >
                <option value="">Sélectionnez un utilisateur</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - Rôle actuel: {roles.find(r => r.value === user.role)?.label || user.role}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-400" />
                Sélectionner un rôle
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  if (successMessage) setSuccessMessage('');
                }}
                className="w-full rounded-lg border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
              >
                <option value="">Sélectionnez un rôle</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            
            {/* Selected User Info */}
            {selectedUser && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-blue-400" />
                  Utilisateur sélectionné
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Nom:</p>
                    <p className="text-white font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email:</p>
                    <p className="text-white font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rôle actuel:</p>
                    <p className="text-white font-medium">{roles.find(r => r.value === selectedUser.role)?.label || selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Statut:</p>
                    <p className="text-white font-medium capitalize">{selectedUser.status}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Summary */}
            {selectedUser && selectedRole && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-purple-400" />
                  Résumé de l'attribution
                </h3>
                <p className="text-gray-300">
                  Vous êtes sur le point d'attribuer le rôle <span className="text-purple-300 font-medium">{roles.find(r => r.value === selectedRole)?.label || selectedRole}</span> à l'utilisateur <span className="text-white font-medium">{selectedUser.name}</span>.
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleConfirm}
                disabled={!selectedUserId || !selectedRole || isLoading}
                className="flex-1"
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Attribuer le rôle
              </Button>
              
              <Button 
                variant="secondary" 
                size="md" 
                onClick={handleReset}
                className="flex-1"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Confirmation Modal */}
        <Modal 
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Confirmer l'attribution du rôle"
          size="md"
        >
          {selectedUser && selectedRole && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Êtes-vous sûr de vouloir attribuer le rôle <strong>{roles.find(r => r.value === selectedRole)?.label || selectedRole}</strong> à l'utilisateur <strong>{selectedUser.name}</strong> ?
              </p>
              <p className="text-gray-400 text-sm">
                Cette action modifiera les permissions de l'utilisateur en conséquence.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowConfirmation(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleAssignRole}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Attribution...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AssignRoles;
