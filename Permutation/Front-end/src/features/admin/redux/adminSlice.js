// src/features/admin/redux/adminSlice.js
// Slice Redux pour les fonctionnalités admin
// Gère les utilisateurs, établissements, logs et autres fonctionnalités admin

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ==================== USERS MANAGEMENT ====================
// Async thunk pour charger les utilisateurs
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données simulées
      const mockUsers = [
        { id: 1, name: 'Ahmed Mohamed', email: 'ahmed@ofppt.ma', role: 'admin', status: 'actif', dateCreated: '2024-01-01', lastLogin: '2024-01-15' },
        { id: 2, name: 'Fatima Karim', email: 'fatima@ofppt.ma', role: 'commission', status: 'actif', dateCreated: '2024-01-02', lastLogin: '2024-01-14' },
        { id: 3, name: 'Youssef Tahiri', email: 'youssef@ofppt.ma', role: 'formateur', status: 'actif', dateCreated: '2024-01-03', lastLogin: '2024-01-13' },
        { id: 4, name: 'Sara El Mansouri', email: 'sara@ofppt.ma', role: 'formateur', status: 'bloque', dateCreated: '2024-01-04', lastLogin: '2024-01-10' },
      ];
      
      return mockUsers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des utilisateurs');
    }
  }
);

// ==================== STATS MANAGEMENT ====================
// Async thunk pour charger les statistiques admin
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données simulées pour les statistiques
      const mockStats = {
        totalUsers: 2879,
        activeUsers: 2456,
        validatedRequests: 1242,
        pendingRequests: 87,
        totalEstablishments: 23,
        totalAdmins: 12,
        totalCommission: 5,
        totalFormateurs: 2862,
      };
      
      return mockStats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des statistiques');
    }
  }
);

// Async thunk pour créer un utilisateur
export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUser = {
        id: Date.now(),
        ...userData,
        dateCreated: new Date().toISOString().split('T')[0],
        lastLogin: null
      };
      return newUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de création de l\'utilisateur');
    }
  }
);

// Async thunk pour supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return userId; // Return the ID of the deleted user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de suppression de l\'utilisateur');
    }
  }
);

// Async thunk pour mettre à jour un utilisateur
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simuler la mise à jour de l'utilisateur
      return { id, ...userData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de mise à jour de l\'utilisateur');
    }
  }
);

// ==================== ETABLISSEMENT MANAGEMENT ====================
// Async thunk pour charger les informations de l'établissement
export const fetchEtablissement = createAsyncThunk(
  'admin/fetchEtablissement',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const etablissement = {
        id: 1,
        code: 'ETAB-001',
        nom: 'École Supérieure de Technologie',
        adresse: 'Avenue Hassan II, Casablanca',
        actif: true,
        telephone: '+212 522-123456',
        email: 'contact@etab.ac.ma',
        responsable: 'Dr. Ahmed Benali',
        type: 'École Supérieure',
        capacite: 1500,
        createdAt: '2020-09-01',
      };
      
      return etablissement;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement de l\'établissement');
    }
  }
);

// Async thunk pour mettre à jour les informations de l'établissement
export const updateEtablissement = createAsyncThunk(
  'admin/updateEtablissement',
  async (etablissementData, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simuler la mise à jour de l'établissement
      return etablissementData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de mise à jour de l\'établissement');
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  // Users state
  users: {
    data: [],
    loading: false,
    error: null,
  },
  
  // Etablissement state
  etablissement: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Stats state
  stats: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Logs state (à implémenter)
  logs: {
    data: [],
    loading: false,
    error: null,
  }
};

// ==================== SLICE DEFINITION ====================
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Reset all admin state
    resetAdmin: (state) => {
      state.users.data = [];
      state.users.loading = false;
      state.users.error = null;
      state.etablissement.data = null;
      state.etablissement.loading = false;
      state.etablissement.error = null;
    },
    
    // Reset users state
    resetUsers: (state) => {
      state.users.data = [];
      state.users.loading = false;
      state.users.error = null;
    },
    
    // Reset etablissement state
    resetEtablissement: (state) => {
      state.etablissement.data = null;
      state.etablissement.loading = false;
      state.etablissement.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Users reducers
      .addCase(fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload;
        state.users.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.data.push(action.payload);
        state.users.loading = false;
      })
      
      // Etablissement reducers
      .addCase(fetchEtablissement.pending, (state) => {
        state.etablissement.loading = true;
        state.etablissement.error = null;
      })
      .addCase(fetchEtablissement.fulfilled, (state, action) => {
        state.etablissement.loading = false;
        state.etablissement.data = action.payload;
        state.etablissement.error = null;
      })
      .addCase(fetchEtablissement.rejected, (state, action) => {
        state.etablissement.loading = false;
        state.etablissement.error = action.payload;
      })
      .addCase(updateEtablissement.fulfilled, (state, action) => {
        state.etablissement.data = action.payload;
        state.etablissement.loading = false;
        state.etablissement.error = null;
      })
      
      // Stats reducers
      .addCase(fetchAdminStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
        state.stats.error = null;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      })
      
      // Update user reducer
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users.data[index] = { ...state.users.data[index], ...action.payload };
        }
      })
      
      // Delete user reducer
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users.data = state.users.data.filter(user => user.id !== action.payload);
      });
  },
});

// ==================== SELECTORS ====================
// Users selectors
export const selectUsers = (state) => state.admin.users.data;
export const selectUsersLoading = (state) => state.admin.users.loading;
export const selectUsersError = (state) => state.admin.users.error;

// Etablissement selectors
export const selectEtablissement = (state) => state.admin.etablissement.data;
export const selectEtablissementLoading = (state) => state.admin.etablissement.loading;
export const selectEtablissementError = (state) => state.admin.etablissement.error;

// Stats selectors
export const selectAdminStats = (state) => state.admin.stats.data;
export const selectAdminStatsLoading = (state) => state.admin.stats.loading;
export const selectAdminStatsError = (state) => state.admin.stats.error;

// ==================== EXPORTS ====================
export const { resetAdmin, resetUsers, resetEtablissement } = adminSlice.actions;
export default adminSlice.reducer;