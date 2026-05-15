import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { listRoles } from '../../../services/adminService';
import { listUsers, updateUser } from '../../../services/usersService';
import { useToast } from '../../../shared/context/useToast';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

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
        const [r, u] = await Promise.all([listRoles(), listUsers(1, -1)]);
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
      const roleLabel = roles.find(r => r.value === selectedRole)?.label || selectedRole;
      success(`Rôle ${roleLabel} attribué à ${updated.name} avec succès`);
      setSuccessMessage(`Rôle ${roleLabel} attribué à ${updated.name} avec succès !`);
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
      <div className="max-w-4xl mx-auto space-y-10 pb-12">
        <div>
          <h1 className="text-4xl font-black text-jb-text-primary tracking-tighter uppercase">Attribution des Rôles</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="h-1 w-12 bg-jb-gradient-alt rounded-full"></span>
            <p className="text-jb-text-muted font-bold uppercase tracking-[0.2em] text-[10px]">Gestion des privilèges et accès utilisateurs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-10 bg-jb-bg-section border border-jb-border rounded-lg shadow-hard">
              {/* Success Message */}
              {successMessage && (
                <div className="mb-10 p-5 rounded-lg bg-jb-green/10 border border-jb-green/20 flex items-center gap-4 animate-slide-in">
                  <CheckCircleIcon className="w-6 h-6 text-jb-green shrink-0" />
                  <p className="text-xs font-black text-jb-green uppercase tracking-widest">{successMessage}</p>
                </div>
              )}

              <div className="space-y-10">
                {/* User Selection */}
                <div className="space-y-4">
                  <label className="flex items-center text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em] ml-1">
                    <UserGroupIcon className="w-4 h-4 mr-2 text-jb-cyan" />
                    Utilisateur cible
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedUserId}
                      onChange={(e) => {
                        setSelectedUserId(e.target.value);
                        if (successMessage) setSuccessMessage('');
                      }}
                      className="w-full bg-[#D8E9FB] border border-jb-border rounded-lg px-5 py-4 text-jb-text-primary text-sm font-bold focus:border-jb-cyan outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner un compte</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </select>
                    <ChevronRightIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-jb-text-muted group-hover:text-jb-cyan transition-colors rotate-90" />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                  <label className="flex items-center text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em] ml-1">
                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-jb-purple" />
                    Privilège à attribuer
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className={`flex flex-col items-start p-5 rounded-lg border-2 transition-all text-left group ${
                          selectedRole === role.value
                            ? 'bg-jb-purple/10 border-jb-purple shadow-lg shadow-jb-purple/10'
                            : 'bg-jb-bg-main border-jb-border hover:border-jb-purple/40'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                          selectedRole === role.value ? 'text-jb-purple' : 'text-jb-text-muted group-hover:text-jb-purple/60'
                        }`}>
                          Code: {role.value}
                        </span>
                        <span className={`text-sm font-bold ${
                          selectedRole === role.value ? 'text-jb-text-primary' : 'text-jb-text-secondary'
                        }`}>
                          {role.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-jb-border">
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    className="flex-1 text-jb-text-muted hover:text-jb-text-primary font-black uppercase tracking-widest text-[10px] py-4"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedUserId || !selectedRole}
                    className={`flex-1 py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all ${
                      selectedUserId && selectedRole
                        ? 'bg-jb-gradient-alt text-white shadow-primary border-none'
                        : 'bg-jb-bg-elevated text-jb-text-muted border border-jb-border cursor-not-allowed opacity-50'
                    }`}
                  >
                    Confirmer l'attribution
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Info Panel */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-8 bg-jb-bg-section border border-jb-border rounded-lg relative overflow-hidden">
              <div className="absolute -top-4 -right-4 p-8 opacity-[0.03]">
                <ShieldCheckIcon className="w-32 h-32 text-jb-purple" />
              </div>
              <h3 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em] mb-8 pb-4 border-b border-jb-border">
                Résumé de l'action
              </h3>

              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-jb-text-muted uppercase tracking-widest">Utilisateur sélectionné</p>
                  <p className="text-sm font-bold text-jb-text-primary">{selectedUser ? selectedUser.name : 'Aucun'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-jb-text-muted uppercase tracking-widest">Futur Rôle</p>
                  <p className="text-sm font-bold text-jb-purple">
                    {selectedRole ? (roles.find(r => r.value === selectedRole)?.label || selectedRole) : 'Non défini'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-jb-blue/5 border border-jb-blue/10">
                  <p className="text-[10px] text-jb-blue font-bold leading-relaxed italic">
                    "L'attribution d'un rôle modifie immédiatement les droits d'accès de l'utilisateur."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Confirmer l'attribution"
          size="md"
        >
          <div className="space-y-5 py-1">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start p-4 rounded-lg bg-jb-bg-elevated border border-jb-border">
              <div className="w-16 h-16 bg-jb-purple/10 rounded-lg border border-jb-purple/20 flex items-center justify-center text-jb-purple">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jb-text-muted">Validation finale</p>
                <h3 className="text-lg font-black text-jb-text-primary uppercase tracking-tight">Confirmer l'attribution du rôle</h3>
                <p className="text-jb-text-secondary leading-relaxed text-sm">
                  Vous allez attribuer le rôle <span className="text-jb-purple font-black">"{roles.find(r => r.value === selectedRole)?.label}"</span> à <span className="text-jb-text-primary font-black">"{selectedUser?.name}"</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg border border-jb-border bg-white">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-jb-text-muted">Utilisateur</p>
                <p className="text-sm font-bold text-jb-text-primary mt-2 truncate">{selectedUser?.name || '—'}</p>
              </div>
              <div className="p-4 rounded-lg border border-jb-border bg-white">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-jb-text-muted">Rôle cible</p>
                <p className="text-sm font-bold text-jb-purple mt-2 truncate">{roles.find(r => r.value === selectedRole)?.label || '—'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-jb-border">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 text-jb-text-muted hover:text-jb-text-primary font-black uppercase tracking-widest text-[10px]"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAssignRole}
                isLoading={isLoading}
                className="flex-1 bg-jb-purple hover:bg-jb-purple/80 text-white shadow-hard font-black uppercase tracking-widest text-[10px] py-4 rounded-lg"
              >
                Confirmer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default AssignRoles;
