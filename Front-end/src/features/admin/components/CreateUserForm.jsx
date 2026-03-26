import React, { useState, useEffect } from 'react';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { UserPlusIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { listUserStatuses } from '../../../services/paramService';
import { listRoles } from '../../../services/adminService';

/**
 * Composant de formulaire pour créer un utilisateur
 * 
 * Ce composant gère le formulaire de création d'utilisateur
 * et peut être utilisé dans d'autres composants comme UserManagement
 */
const CreateUserForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    status: 'actif'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.role) {
      newErrors.role = 'Le rôle est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onSubmit callback
      onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        status: 'actif'
      });
      
      setSuccessMessage('Compte créé avec succès !');
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {successMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center animate-slideDown">
          <CheckCircleIcon className="w-5 h-5 text-teal-600 mr-3" />
          <span className="text-xs font-black text-teal-700 uppercase tracking-widest">{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
              Nom complet *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full bg-surface-50 border ${
                errors.name ? 'border-rose-500' : 'border-surface-200'
              } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
              placeholder="Entrez le nom complet"
            />
            {errors.name && (
              <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
              Email Professionnel *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-surface-50 border ${
                errors.email ? 'border-rose-500' : 'border-surface-200'
              } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
              placeholder="utilisateur@ofppt.ma"
            />
            {errors.email && (
              <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
                {errors.email}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full bg-surface-50 border ${
                errors.password ? 'border-rose-500' : 'border-surface-200'
              } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
              placeholder="Min. 6 caractères"
            />
            {errors.password && (
              <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
                {errors.password}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
              Rôle Système *
            </label>
            <div className="relative group">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full bg-surface-50 border ${
                  errors.role ? 'border-rose-500' : 'border-surface-200'
                } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer`}
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
            {errors.role && (
              <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
                {errors.role}
              </p>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
              Statut Initial
            </label>
            <div className="relative group">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-surface-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-surface-50">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            className="px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 flex items-center justify-center group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
                <span>Création...</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span>Créer le compte</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
