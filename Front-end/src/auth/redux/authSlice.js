// src/auth/redux/authSlice.js
// Slice Redux pour la gestion de l'authentification sécurisée
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Services d'authentification sécurisée
import * as authService from '../../services/authService';

/**
 * Thunk asynchrone pour la connexion sécurisée
 * Gère toute la logique d'authentification avec Laravel Sanctum
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔄 Processus d\'authentification démarré');
      
      // Étape 1 : Connexion via Laravel Sanctum
      // Cela génère un cookie de session HttpOnly côté backend
      await authService.login(credentials);
      console.log('✅ Connexion backend réussie');
      
      // Étape 2 : Récupérer les informations complètes de l'utilisateur
      // Grâce au cookie, l'utilisateur est déjà authentifié
      const userResponse = await authService.getCurrentUser();
      console.log('✅ Informations utilisateur récupérées');
      
      // Retourner les informations de l'utilisateur
      // Le cookie est géré automatiquement par le navigateur
      return userResponse;
    } catch (error) {
      console.error('❌ Erreur d\'authentification:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk asynchrone pour la déconnexion
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Déconnexion côté backend
      await authService.logout();
      // Réinitialiser l'état Redux
      dispatch(resetAuth());
    } catch (_error) {
      // Même en cas d'erreur, réinitialiser l'état
      dispatch(resetAuth());
    }
  }
);

/**
 * Thunk pour vérifier l'état d'authentification au démarrage
 */
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Vérifier si l'utilisateur est toujours connecté
      const response = await authService.getCurrentUser();
      return response;
    } catch (_error) {
      // Si erreur 401, l'utilisateur n'est plus authentifié
      return rejectWithValue('Non authentifié');
    }
  }
);

// État initial de l'authentification
const initialState = {
  user: null,           // Informations de l'utilisateur connecté
  isAuthenticated: false, // État d'authentification
  loading: false,       // État de chargement
  error: null,          // Messages d'erreur
  role: null            // Rôle de l'utilisateur (admin/commission/formateur)
};

/**
 * Slice Redux pour l'authentification
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Réinitialiser l'état d'authentification
     */
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.error = null;
    },
    
    /**
     * Mettre à jour les informations utilisateur
     */
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.user?.role || null;
      state.isAuthenticated = true;
      state.error = null;
    }
  },
  
  // Gestion des états pour les thunks asynchrones
  extraReducers: (builder) => {
    builder
      // === LOGIN STATES ===
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.role = action.payload.user?.role || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.error = action.payload;
      })
      
      // === LOGOUT STATES ===
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.error = null;
      })
      
      // === CHECK AUTH STATUS STATES ===
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.role = action.payload.user?.role || null;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
      });
  }
});

// === SELECTEURS POUR ACCÉDER À L'ÉTAT ===
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// === EXPORTS ===
export const { resetAuth, setUser } = authSlice.actions;
export default authSlice.reducer;