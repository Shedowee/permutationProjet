import React, { useState } from 'react';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { UserPlusIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { USER_ROLES, USER_STATUSES } from '../../../shared/constants/constants';

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
    status: USER_STATUSES.ACTIF
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        status: USER_STATUSES.ACTIF
      });
      
      setSuccessMessage('Compte créé avec succès !');
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
          <span className="text-green-400">{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-800/50 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
              placeholder="Entrez le nom complet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-800/50 border ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
              placeholder="Entrez l'adresse email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-800/50 border ${
                errors.password ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
              placeholder="Entrez le mot de passe"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Rôle
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-800/50 border ${
                errors.role ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            >
              <option value="">Sélectionnez un rôle</option>
              {Object.values(USER_ROLES).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.role}
              </p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              {Object.values(USER_STATUSES).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full md:w-auto flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Créer le compte
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateUserForm;