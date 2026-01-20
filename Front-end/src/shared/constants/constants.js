// Constants for the Admin Panel

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;

// OFPPT entity types
export const OFPPT_ENTITY_TYPES = [
  { value: 'establishment', label: 'Établissement' },
  { value: 'field', label: 'Filière' },
  { value: 'group', label: 'Groupe' },
  { value: 'trainee', label: 'Stagiaire' },
];

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'Ce champ est requis',
  email: 'Veuillez entrer une adresse email valide',
  minLength: (min) => `Minimum ${min} caractères requis`,
  maxLength: (max) => `Maximum ${max} caractères autorisés`,
  passwordStrength: 'Le mot de passe doit contenir au moins 6 caractères',
};

// Status badges
export const STATUS_BADGES = {
  active: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30',
  inactive: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30',
  blocked: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30',
  pending: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30',
};

// Action button styles
export const ACTION_BUTTON_STYLES = {
  view: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30',
  edit: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 hover:from-purple-600/30 hover:to-violet-600/30 border border-purple-500/30',
  delete: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-600/30 hover:to-pink-600/30 border border-red-500/30',
};
