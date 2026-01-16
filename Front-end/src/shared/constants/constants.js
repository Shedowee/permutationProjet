// Constants for the Admin Panel

// User roles
export const USER_ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'user', label: 'Utilisateur' },
  { value: 'staff', label: 'Personnel' },
  { value: 'student', label: 'Étudiant' },
  { value: 'trainer', label: 'Formateur' },
];

// User statuses
export const USER_STATUSES = [
  { value: 'active', label: 'Actif', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inactif', color: 'bg-gray-500' },
  { value: 'blocked', label: 'Bloqué', color: 'bg-red-500' },
  { value: 'pending', label: 'En attente', color: 'bg-yellow-500' },
];

// Log action types
export const LOG_ACTION_TYPES = [
  { value: 'login', label: 'Connexion', color: 'bg-blue-500' },
  { value: 'logout', label: 'Déconnexion', color: 'bg-gray-500' },
  { value: 'create_account', label: 'Création de compte', color: 'bg-green-500' },
  { value: 'update_profile', label: 'Mise à jour profil', color: 'bg-purple-500' },
  { value: 'assign_role', label: 'Attribution de rôle', color: 'bg-indigo-500' },
  { value: 'block_user', label: 'Blocage utilisateur', color: 'bg-red-500' },
  { value: 'unblock_user', label: 'Déblocage utilisateur', color: 'bg-teal-500' },
  { value: 'delete_user', label: 'Suppression utilisateur', color: 'bg-orange-500' },
];

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