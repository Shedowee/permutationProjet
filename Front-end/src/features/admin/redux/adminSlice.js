// src/features/admin/redux/adminSlice.js
// Slice Redux pour les fonctionnalités admin
// Gère les utilisateurs, établissements, logs et autres fonctionnalités admin

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/usersService';
import api from '../../../services/api';

const mapEtablissementFromApi = (e = {}) => ({
  ...e,
  actif: typeof e.actif === 'boolean' ? e.actif : !!e.actif,
  city_id: e.city_id ?? e.ville?.id ?? '',
  region_id: e.region_id ?? e.ville?.parent?.id ?? e.ville?.region?.id ?? '',
  city_label: e.city_label || e.ville?.value?.libelle || e.ville?.libelle || '',
  region_label: e.region_label || e.ville?.parent?.value?.libelle || e.ville?.region?.value?.libelle || '',
});

// ==================== USERS MANAGEMENT ====================
// Async thunk pour charger les utilisateurs
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 5, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const normalizedFilters = {
        ...filters,
        ...(filters.pending ? { pending: 1 } : {}),
      };
      const users = await usersApi.listUsers(page, limit, normalizedFilters);
      return users;
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
      const response = await api.get('/api/admin/stats', { withCredentials: true });
      return response.data?.data ?? null;
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
      const created = await usersApi.createUser(userData);
      return created;
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
      await usersApi.deleteUser(userId);
      return userId;
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
      const updated = await usersApi.updateUser({ id, ...userData });
      return updated;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de mise à jour de l\'utilisateur');
    }
  }
);

// ==================== ETABLISSEMENT MANAGEMENT ====================
// Async thunk pour lister tous les établissements
export const fetchEtablissements = createAsyncThunk(
  'admin/fetchEtablissements',
  async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      const res = await api.get(`/api/etablissements?${params.toString()}`, { withCredentials: true });
      return {
        data: (res.data?.data ?? []).map(mapEtablissementFromApi),
        meta: res.data?.meta ?? null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des établissements');
    }
  }
);

// Async thunk pour créer un établissement
export const createEtablissement = createAsyncThunk(
  'admin/createEtablissement',
  async (etabData, { rejectWithValue }) => {
    try {
      const payload = {
        name: etabData.name ?? etabData.nom,
        address: etabData.address ?? etabData.adresse,
        contact_phone: etabData.contact_phone,
        contact_email: etabData.contact_email,
        city_id: etabData.city_id,
        metadata: etabData.metadata,
        actif: typeof etabData.actif === 'boolean' ? etabData.actif : undefined,
      };
      const res = await api.post('/api/etablissements', payload, { withCredentials: true });
      return mapEtablissementFromApi(res.data?.data ?? {});
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de création de l\'établissement');
    }
  }
);

// Async thunk pour supprimer un établissement
export const deleteEtablissement = createAsyncThunk(
  'admin/deleteEtablissement',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/etablissements/${id}`, { withCredentials: true });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de suppression de l\'établissement');
    }
  }
);

// Async thunk pour charger les informations d'un établissement (premier trouvé)
export const fetchEtablissement = createAsyncThunk(
  'admin/fetchEtablissement',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/etablissements', { withCredentials: true });
      const list = res.data?.data ?? [];
      const first = list[0] || null;
      if (!first) {
        return rejectWithValue('Aucun établissement actif trouvé');
      }
      return mapEtablissementFromApi({
        id: first.id,
        code: first.code || '',
        nom: first.nom || '',
        adresse: first.adresse || '',
        actif: !!first.actif,
        city_id: first.city_id ?? first.ville?.id ?? '',
        ville: first.ville,
      });
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
      const payload = {
        ...(etablissementData.name !== undefined ? { name: etablissementData.name } : {}),
        ...(etablissementData.nom !== undefined ? { name: etablissementData.nom } : {}),
        ...(etablissementData.address !== undefined ? { address: etablissementData.address } : {}),
        ...(etablissementData.adresse !== undefined ? { address: etablissementData.adresse } : {}),
        ...(etablissementData.contact_phone !== undefined ? { contact_phone: etablissementData.contact_phone } : {}),
        ...(etablissementData.contact_email !== undefined ? { contact_email: etablissementData.contact_email } : {}),
        ...(etablissementData.city_id !== undefined ? { city_id: etablissementData.city_id } : {}),
        ...(etablissementData.metadata !== undefined ? { metadata: etablissementData.metadata } : {}),
        ...(etablissementData.actif !== undefined ? { actif: etablissementData.actif } : {}),
      };
      const res = await api.put(`/api/etablissements/${etablissementData.id}`, payload, { withCredentials: true });
      return mapEtablissementFromApi(res.data?.data ?? etablissementData);
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
    meta: null,
    loading: false,
    error: null,
  },
  
  // Etablissement state
  etablissement: {
    data: [],
    meta: null,
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
        state.users.data = action.payload.data;
        state.users.meta = action.payload.meta;
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
      .addCase(fetchEtablissements.pending, (state) => {
        state.etablissement.loading = true;
        state.etablissement.error = null;
      })
      .addCase(fetchEtablissements.fulfilled, (state, action) => {
        state.etablissement.loading = false;
        state.etablissement.data = action.payload.data;
        state.etablissement.meta = action.payload.meta;
        state.etablissement.error = null;
      })
      .addCase(fetchEtablissements.rejected, (state, action) => {
        state.etablissement.loading = false;
        state.etablissement.error = action.payload;
      })
      .addCase(fetchEtablissement.pending, (state) => {
        state.etablissement.loading = true;
        state.etablissement.error = null;
      })
      .addCase(fetchEtablissement.fulfilled, (state, action) => {
        state.etablissement.loading = false;
        // When single item is fetched, keep list semantics by merging/replacing
        const item = action.payload;
        if (!item) return;
        const idx = state.etablissement.data.findIndex(e => e.id === item.id);
        if (idx === -1) state.etablissement.data.push(item);
        else state.etablissement.data[idx] = item;
        state.etablissement.error = null;
      })
      .addCase(fetchEtablissement.rejected, (state, action) => {
        state.etablissement.loading = false;
        state.etablissement.error = action.payload;
      })
      .addCase(updateEtablissement.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.etablissement.data.findIndex(e => e.id === updated.id);
        if (idx !== -1) state.etablissement.data[idx] = updated;
        else state.etablissement.data.push(updated);
        state.etablissement.loading = false;
        state.etablissement.error = null;
      })
      .addCase(createEtablissement.fulfilled, (state, action) => {
        if (action.payload) state.etablissement.data.unshift(action.payload);
      })
      .addCase(deleteEtablissement.fulfilled, (state, action) => {
        const id = action.payload;
        state.etablissement.data = state.etablissement.data.filter(e => e.id !== id);
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
export const selectUsersMeta = (state) => state.admin.users.meta;
export const selectUsersLoading = (state) => state.admin.users.loading;
export const selectUsersError = (state) => state.admin.users.error;

// Etablissement selectors
export const selectEtablissement = (state) => state.admin.etablissement.data;
export const selectEtablissementLoading = (state) => state.admin.etablissement.loading;
export const selectEtablissementError = (state) => state.admin.etablissement.error;
export const selectEtablissementMeta = (state) => state.admin.etablissement.meta;

// Stats selectors
export const selectAdminStats = (state) => state.admin.stats.data;
export const selectAdminStatsLoading = (state) => state.admin.stats.loading;
export const selectAdminStatsError = (state) => state.admin.stats.error;

// ==================== EXPORTS ====================
export const { resetAdmin, resetUsers, resetEtablissement } = adminSlice.actions;
export default adminSlice.reducer;
