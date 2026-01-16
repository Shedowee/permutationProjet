// src/app/store.js
// Configuration centrale du store Redux avec Redux Toolkit
// Cette configuration centralise tous les reducers de l'application

import { configureStore } from '@reduxjs/toolkit';

// Import des slices Redux
import authReducer from '../auth/redux/authSlice';
import adminReducer from '../features/admin/redux/adminSlice';
import commissionReducer from '../features/commission/redux/commissionSlice';
import formateurReducer from '../features/formateur/redux/formateurSlice';
import logsReducer from '../features/admin/redux/logsSlice';

/**
 * Configuration du store Redux central
 * 
 * Utilisation de Redux Toolkit pour :
 * - Gestion automatique de l'immer (immutable state)
 * - Middleware Redux DevTools intégré
 * - Configuration optimisée par défaut
 * 
 * Structure des slices :
 * - auth : Gestion de l'authentification et des rôles
 * - admin : Fonctionnalités spécifiques à l'administrateur
 * - commission : Fonctionnalités de la commission
 * - formateur : Fonctionnalités du formateur
 */
const store = configureStore({
  reducer: {
    // Slice pour l'authentification et la gestion des rôles
    auth: authReducer,
    
    // Slice pour les fonctionnalités admin
    admin: adminReducer,
    
    // Slice pour les fonctionnalités commission
    commission: commissionReducer,
    
    // Slice pour les fonctionnalités formateur
    formateur: formateurReducer,
    
    // Slice pour les logs admin
    logs: logsReducer,
  },
  
  // Configuration middleware (Redux DevTools activé par défaut)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Désactiver les checks en développement pour plus de flexibilité
      serializableCheck: false,
      immutableCheck: false,
    }),
  
  // Activation de Redux DevTools
  devTools: true,
});

// Export du store pour utilisation dans l'application
export default store;