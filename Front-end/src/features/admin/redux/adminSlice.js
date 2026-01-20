// src/features/admin/redux/adminSlice.js
// Slice Redux pour les fonctionnalités admin
// Gère les utilisateurs, établissements, logs et autres fonctionnalités admin

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../../../services/usersService';
import api from '../../../services/api';

// ==================== USERS MANAGEMENT ====================
// Async thunk pour charger les utilisateurs
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await usersApi.listUsers();
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
      const [usersRes, demandesRes, etabsRes, logsRes] = await Promise.all([
        api.get('/api/users', { withCredentials: true }),
        api.get('/api/demandes', { withCredentials: true }),
        api.get('/api/etablissements', { withCredentials: true }),
        api.get('/api/logs', { withCredentials: true }),
      ]);

      const users = usersRes.data?.data ?? [];
      const demandes = demandesRes.data?.data ?? [];
      const etablissements = etabsRes.data?.data ?? [];
      const logs = logsRes.data?.data ?? [];

      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.status === 'actif').length;

      const roleCounts = users.reduce((acc, u) => {
        const role = (u.role || '').toLowerCase();
        if (!role) return acc;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const totalAdmins = roleCounts['admin'] || 0;
      const totalCommission = roleCounts['commission'] || 0;
      const totalFormateurs = roleCounts['formateur'] || 0;

      const validatedRequests = demandes.filter(
        (d) => d.etat && d.etat.code === 'VALIDE'
      ).length;
      const pendingRequests = demandes.filter(
        (d) => d.etat && d.etat.code === 'EN_ATTENTE'
      ).length;

      const totalEstablishments = etablissements.length;

      const now = new Date();
      const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      const monthlyActivityData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;
        const label = monthLabels[date.getMonth()];

        const monthLogs = logs.filter((log) => {
          if (!log.date) return false;
          const d = new Date(log.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            '0'
          )}`;
          return key === monthKey;
        });

        const usersCount = monthLogs.filter((l) => l.type === 'login').length;
        const registrationsCount = monthLogs.filter(
          (l) => l.type === 'create'
        ).length;

        monthlyActivityData.push({
          month: label,
          users: usersCount,
          registrations: registrationsCount,
        });
      }

      const userStatsData = Object.entries(roleCounts).map(([role, count]) => {
        let name = role;
        if (role === 'admin') name = 'Admins';
        else if (role === 'commission') name = 'Commission';
        else if (role === 'formateur') name = 'Formateurs';
        return { name, value: count };
      });

      const regionCounts = demandes.reduce((acc, d) => {
        const regionObj = d.region_souhaitee || d.regionSouhaitee || null;
        const regionName =
          (regionObj && (regionObj.libelle || regionObj.code)) || 'Autre';
        acc[regionName] = (acc[regionName] || 0) + 1;
        return acc;
      }, {});

      const regionStats = Object.entries(regionCounts)
        .map(([region, count]) => ({
          region,
          users: count,
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 5)
        .map((entry) => {
          if (!demandes.length) {
            return { ...entry, growth: '0%' };
          }
          const share = (entry.users / demandes.length) * 100;
          return {
            ...entry,
            growth: `${Math.round(share)}%`,
          };
        });

      const recentActions = logs.slice(0, 5).map((log) => ({
        id: log.id,
        user: log.user,
        action: log.action,
        time: log.date,
        type: log.type,
      }));

      return {
        totalUsers,
        activeUsers,
        validatedRequests,
        pendingRequests,
        totalEstablishments,
        totalAdmins,
        totalCommission,
        totalFormateurs,
        monthlyActivityData,
        userStatsData,
        regionStats,
        recentActions,
      };
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
// Async thunk pour charger les informations de l'établissement
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
      return {
        id: first.id,
        code: first.code || '',
        nom: first.nom || '',
        adresse: first.adresse || '',
        actif: !!first.actif,
      };
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
        ...(etablissementData.code !== undefined ? { code: etablissementData.code } : {}),
        ...(etablissementData.nom !== undefined ? { nom: etablissementData.nom } : {}),
        ...(etablissementData.adresse !== undefined ? { adresse: etablissementData.adresse } : {}),
        ...(etablissementData.actif !== undefined ? { actif: etablissementData.actif } : {}),
      };
      const res = await api.put(`/api/etablissements/${etablissementData.id}`, payload, { withCredentials: true });
      const d = res.data?.data ?? etablissementData;
      return {
        id: d.id,
        code: d.code || '',
        nom: d.nom || '',
        adresse: d.adresse || '',
        actif: !!d.actif,
      };
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
