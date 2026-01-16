import React, { useState } from 'react';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { USER_ROLES, USER_STATUSES, VALIDATION_MESSAGES } from '../../../shared/constants/constants';
import { UserPlusIcon, UserIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'active',
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = VALIDATION_MESSAGES.required;
    } else if (formData.name.length < 3) {
      newErrors.name = VALIDATION_MESSAGES.minLength(3);
    }
    
    if (!formData.email) {
      newErrors.email = VALIDATION_MESSAGES.required;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.email;
    }
    
    if (!formData.password) {
      newErrors.password = VALIDATION_MESSAGES.required;
    } else if (formData.password.length < 6) {
      newErrors.password = VALIDATION_MESSAGES.passwordStrength;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.required;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
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
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      console.log('Creating account:', formData);
      
      setSuccessMessage(`Compte pour ${formData.name} créé avec succès !`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active',
      });
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Créer un Compte</h1>
          <p className="text-gray-400 mt-2">Remplissez le formulaire pour créer un nouveau compte utilisateur</p>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-start">
                <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-green-400">{successMessage}</span>
              </div>
            )}
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <UserIcon className="w-4 h-4 mr-2 text-blue-400" />
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border-0 py-3 px-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border ${errors.name ? 'border-red-500/50' : 'border-white/10'} transition-colors duration-200`}
                placeholder="Entrez le nom complet"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-blue-400" />
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border-0 py-3 px-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border ${errors.email ? 'border-red-500/50' : 'border-white/10'} transition-colors duration-200`}
                placeholder="exemple@domaine.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
            
            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <LockClosedIcon className="w-4 h-4 mr-2 text-blue-400" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-0 py-3 px-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border ${errors.password ? 'border-red-500/50' : 'border-white/10'} transition-colors duration-200`}
                  placeholder="Entrez le mot de passe"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <LockClosedIcon className="w-4 h-4 mr-2 text-blue-400" />
                  Confirmer mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-0 py-3 px-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} transition-colors duration-200`}
                  placeholder="Confirmez le mot de passe"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            
            {/* Role and Status Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-400" />
                  Rôle
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                >
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-400" />
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                >
                  {USER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                size="md" 
                className="w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? (
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
      </div>
    </Layout>
  );
};

export default CreateAccount;
