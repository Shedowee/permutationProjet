import React, { useState, useEffect } from 'react';
import { listParametres, listCitiesByRegion } from '../../../services/paramService';

// Fonction utilitaire pour obtenir les données initiales
const getInitialFormData = (establishment) => {
  if (establishment) {
    const regionId =
      establishment.region_id ||
      establishment.ville?.parent_id ||
      establishment.ville?.parent?.id ||
      establishment.ville?.region?.id ||
      '';
    return {
      nom: establishment.name || establishment.nom || '',
      adresse: establishment.address || establishment.adresse || '',
      contact_phone: establishment.contact_phone || '',
      contact_email: establishment.contact_email || '',
      region_id: regionId,
      city_id: establishment.city_id || '',
      actif: typeof establishment.actif !== 'undefined' ? establishment.actif : true
    };
  }
  return {
    nom: '',
    adresse: '',
    contact_phone: '',
    contact_email: '',
    region_id: '',
    city_id: '',
    actif: true
  };
};

const EstablishmentForm = ({ establishment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(establishment));
  const [errors, setErrors] = useState({});
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(establishment));
  }, [establishment]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingOptions(true);
        const regionItems = await listParametres({ type: 'REGION', include_inactive: true });
        setRegions(regionItems.map(region => ({
          id: region.id,
          libelle: region.value?.libelle || region.key
        })));
      } catch (err) {
        console.error("Failed to load regions", err);
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!formData.region_id) {
      setCities([]);
      return;
    }

    (async () => {
      try {
        setLoadingOptions(true);
        const cityItems = await listCitiesByRegion(formData.region_id);
        setCities(cityItems.map(city => ({
          id: city.id,
          libelle: city.value?.libelle || city.key
        })));
      } catch (err) {
        console.error("Failed to load cities", err);
        setCities([]);
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, [formData.region_id]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      ...(name === 'region_id' ? { city_id: '' } : {}),
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

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.city_id) {
      newErrors.city_id = 'La ville est requise';
    }

    if (!formData.region_id) {
      newErrors.region_id = 'La région est requise';
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      const dataToSubmit = {
        ...formData,
        name: formData.nom, // Map nom to name for backend
        address: formData.adresse, // Map adresse to address
      };

      onSubmit(establishment ? { id: establishment.id, ...dataToSubmit } : dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Région */}
        <div className="space-y-3">
          <label htmlFor="region_id" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
            Région *
          </label>
          <select
            id="region_id"
            name="region_id"
            value={formData.region_id}
            onChange={handleChange}
            className={`w-full bg-[#D8E9FB] border ${
              errors.region_id ? 'border-rose-500' : 'border-jb-cyan/20'
            } rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all cursor-pointer`}
          >
            <option value="">Sélectionnez une région</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.libelle}</option>
            ))}
          </select>
          {errors.region_id && (
            <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.region_id}</p>
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
            className={`w-full bg-[#D8E9FB] border ${
              errors.nom ? 'border-rose-500' : 'border-jb-green/20'
            } rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
            placeholder="Ex: ISTA MAARIF"
          />
          {errors.nom && (
            <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.nom}</p>
          )}
        </div>

        {/* Ville */}
        <div className="space-y-3">
          <label htmlFor="city_id" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
            Ville *
          </label>
          <select
            id="city_id"
            name="city_id"
            value={formData.city_id}
            onChange={handleChange}
            disabled={!formData.region_id || loadingOptions}
            className={`w-full bg-[#D8E9FB] border ${
              errors.city_id ? 'border-rose-500' : 'border-jb-cyan/20'
            } rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all cursor-pointer disabled:opacity-60`}
          >
            <option value="">Sélectionnez une ville</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.libelle}</option>
            ))}
          </select>
          {!formData.region_id && (
            <p className="mt-1 text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">Choisissez d'abord une région</p>
          )}
          {errors.city_id && (
            <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.city_id}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="space-y-3">
          <label htmlFor="contact_email" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
            Email de contact
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="w-full bg-[#D8E9FB] border border-jb-green/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
            placeholder="ista@ofppt.ma"
          />
        </div>

        {/* Téléphone */}
        <div className="space-y-3">
          <label htmlFor="contact_phone" className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1 block">
            Téléphone
          </label>
          <input
            type="text"
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="w-full bg-[#D8E9FB] border border-jb-cyan/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
            placeholder="05XXXXXXXX"
          />
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
            className={`w-full bg-[#D8E9FB] border ${
              errors.adresse ? 'border-rose-500' : 'border-jb-green/20'
            } rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400`}
          placeholder="Entrez l'adresse physique de l'établissement"
        />
        {errors.adresse && (
          <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.adresse}</p>
        )}
      </div>

      {/* Statut actif */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-surface-50">
        <label htmlFor="actif" className="relative inline-flex items-center cursor-pointer group select-none">
          <input
            type="checkbox"
            id="actif"
            name="actif"
            checked={formData.actif}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="relative w-14 h-7 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 transition-colors"></div>
          <span className="ml-4 text-[10px] font-black text-surface-700 uppercase tracking-widest cursor-pointer">
            {formData.actif ? 'Établissement actif' : 'Établissement inactif'}
          </span>
        </label>
      </div>

      {/* Boutons */}
      <div className="pt-0 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 bg-[#D8E9FB] border-2 border-jb-cyan/20 text-surface-600 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-surface-50 hover:border-surface-300 transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-12 py-4 bg-primary-600 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
        >
          {establishment ? 'Enregistrer les modifications' : 'Créer l\'établissement'}
        </button>
      </div>
    </form>
  );
};

export default EstablishmentForm;
