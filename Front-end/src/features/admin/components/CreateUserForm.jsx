import React, { useState, useEffect } from 'react';
import Button from '../../../shared/components/Button';
import {
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { listUserStatuses } from '../../../services/paramService';
import { listRoles } from '../../../services/adminService';

const CreateUserForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'pending',
    specialite: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const roleOptions = [
    { value: 'user', label: 'Utilisateur' },
    ...roles.filter((role) => String(role.value).toLowerCase() !== 'user'),
  ];
  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    ...statuses.filter((status) => String(status.value).toLowerCase() !== 'pending'),
  ];

  useEffect(() => {
    (async () => {
      try {
        const data = await listRoles();
        setRoles(data);
      } catch {
        setRoles([]);
      }
    })();

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
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }
    if (!formData.role) newErrors.role = 'Le rôle est requis';
    if (formData.role === 'formateur' && !formData.specialite.trim()) {
      newErrors.specialite = 'La spécialité est requise pour un formateur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, icon: Icon, error }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${error ? 'text-jb-red' : 'text-jb-text-muted group-focus-within:text-jb-cyan'}`} />}
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full bg-jb-bg-main border rounded-xl ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3.5 text-jb-text-primary text-sm font-bold outline-none transition-all ${error ? 'border-jb-red/50 focus:border-jb-red' : 'border-jb-border focus:border-jb-cyan'}`}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-jb-red ml-1 uppercase tracking-tighter">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-lg bg-jb-bg-elevated border border-jb-border">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jb-text-primary">Création de compte</p>
        <p className="text-xs text-jb-text-secondary mt-1">
          Le nouveau compte est créé comme utilisateur de base en attente de validation.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <InputField
              label="Nom Complet"
              name="name"
              placeholder="Ex: Ahmed Alaoui"
              icon={IdentificationIcon}
              error={errors.name}
            />
          </div>

          <InputField
            label="Email Professionnel"
            name="email"
            type="email"
            placeholder="ahmed@ofppt.ma"
            icon={EnvelopeIcon}
            error={errors.email}
          />

          <InputField
            label="Mot de passe"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={KeyIcon}
            error={errors.password}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Rôle Système</label>
            <div className="relative group">
              <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-jb-text-muted group-focus-within:text-jb-purple transition-colors" />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full bg-[#D8E9FB] border rounded-xl pl-11 pr-10 py-3.5 text-jb-text-primary text-sm font-bold outline-none transition-all appearance-none cursor-pointer ${errors.role ? 'border-jb-red/50 focus:border-jb-red' : 'border-jb-border focus:border-jb-purple'}`}
              >
                {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {errors.role && <p className="text-[10px] font-bold text-jb-red ml-1 uppercase tracking-tighter">{errors.role}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Statut Initial</label>
            <div className="relative group">
              <CheckCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-jb-text-muted group-focus-within:text-jb-orange transition-colors" />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-[#D8E9FB] border border-jb-border rounded-xl pl-11 pr-10 py-3.5 text-jb-text-primary text-sm font-bold outline-none transition-all appearance-none cursor-pointer focus:border-jb-orange"
              >
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {formData.role === 'formateur' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest ml-1">Spécialité</label>
            <div className="relative group">
              <input
                type="text"
                name="specialite"
                value={formData.specialite}
                onChange={handleInputChange}
                placeholder="Ex: Génie logiciel, Réseaux, Comptabilité"
                className={`w-full bg-jb-bg-main border rounded-xl px-4 py-3.5 text-jb-text-primary text-sm font-bold outline-none transition-all ${errors.specialite ? 'border-jb-red/50 focus:border-jb-red' : 'border-jb-border focus:border-jb-cyan'}`}
              />
            </div>
            {errors.specialite && <p className="text-[10px] font-bold text-jb-red ml-1 uppercase tracking-tighter">{errors.specialite}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-jb-border">
        <Button
          variant="ghost"
          onClick={onCancel}
          type="button"
          className="text-jb-text-muted hover:text-jb-text-primary text-[10px] font-black uppercase tracking-widest"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="bg-jb-gradient-primary border-none text-white shadow-primary px-10 rounded-xl py-3.5 flex items-center gap-3 group"
        >
          <UserPlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Créer le compte</span>
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
