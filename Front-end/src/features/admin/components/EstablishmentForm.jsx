import React, { useState } from 'react';

// Fonction utilitaire pour obtenir les données initiales
const getInitialFormData = (establishment) => {
  if (establishment) {
    return {
      code: establishment.code || '',
      nom: establishment.nom || '',
      adresse: establishment.adresse || '',
      actif: typeof establishment.actif !== 'undefined' ? establishment.actif : true
    };
  }
  return {
    code: '',
    nom: '',
    adresse: '',
    actif: true
  };
};

const EstablishmentForm = ({ establishment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(establishment));
  const [errors, setErrors] = useState({});

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur associée au champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation des champs
  const validate = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Le code doit contenir au moins 3 caractères';
    }
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    } else if (formData.adresse.length < 5) {
      newErrors.adresse = 'L\'adresse doit contenir au moins 5 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        ...establishment,
        ...formData
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
            Code *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
              errors.code ? 'border-red-500' : 'border-gray-700'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Entrez le code de l'établissement"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-400">{errors.code}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
            Nom *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
              errors.nom ? 'border-red-500' : 'border-gray-700'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Entrez le nom de l'établissement"
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-red-400">{errors.nom}</p>
          )}
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-300 mb-2">
            Adresse *
          </label>
          <textarea
            id="adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            rows="3"
            className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
              errors.adresse ? 'border-red-500' : 'border-gray-700'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Entrez l'adresse de l'établissement"
          />
          {errors.adresse && (
            <p className="mt-1 text-sm text-red-400">{errors.adresse}</p>
          )}
        </div>

        {/* Statut actif */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="actif"
                name="actif"
                checked={formData.actif}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full ${
                formData.actif ? 'bg-blue-600' : 'bg-gray-600'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                formData.actif ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
            <div className="ml-3 text-gray-300">
              {formData.actif ? 'Établissement actif' : 'Établissement inactif'}
            </div>
          </label>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        >
          {establishment ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default EstablishmentForm;