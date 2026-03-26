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
    <form onSubmit={handleSubmit} className="space-y-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Code */}
        <div className="space-y-3">
          <label htmlFor="code" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
            Code Système Unique *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`w-full bg-surface-50 border ${
              errors.code ? 'border-rose-500' : 'border-surface-200'
            } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
            placeholder="EX: EST_CASABLANCA"
          />
          {errors.code && (
            <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.code}</p>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-3">
          <label htmlFor="nom" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
            Nom de l'établissement *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className={`w-full bg-surface-50 border ${
              errors.nom ? 'border-rose-500' : 'border-surface-200'
            } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
            placeholder="Entrez le nom complet"
          />
          {errors.nom && (
            <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.nom}</p>
          )}
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-3">
        <label htmlFor="adresse" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
          Adresse Complète *
        </label>
        <textarea
          id="adresse"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          rows="3"
          className={`w-full bg-surface-50 border ${
            errors.adresse ? 'border-rose-500' : 'border-surface-200'
          } rounded-2xl px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
          placeholder="Entrez l'adresse physique de l'établissement"
        />
        {errors.adresse && (
          <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.adresse}</p>
        )}
      </div>

      {/* Statut actif */}
      <div className="flex items-center space-x-4 pt-4">
        <div className="relative inline-flex items-center cursor-pointer group">
          <input
            type="checkbox"
            id="actif"
            name="actif"
            checked={formData.actif}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 transition-colors"></div>
          <label htmlFor="actif" className="ml-4 text-[10px] font-black text-surface-700 uppercase tracking-widest cursor-pointer select-none">
            {formData.actif ? 'Établissement actif' : 'Établissement inactif'}
          </label>
        </div>
      </div>

      {/* Boutons */}
      <div className="pt-8 flex justify-end space-x-4 border-t border-surface-50">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 bg-white border-2 border-surface-200 text-surface-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-surface-50 hover:border-surface-300 transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-12 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
        >
          {establishment ? 'Enregistrer les modifications' : 'Créer l\'établissement'}
        </button>
      </div>
    </form>
  );
};

export default EstablishmentForm;