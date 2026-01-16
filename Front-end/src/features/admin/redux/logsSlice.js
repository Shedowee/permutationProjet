// src/features/admin/redux/logsSlice.js
// Slice Redux pour la gestion des logs dans la section admin
// Gère l'affichage et la recherche des logs système

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Constantes pour les types d'actions
export const LOG_ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  BLOCK: 'block',
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW: 'view',
  ASSIGN_ROLE: 'assign_role',
  UNBLOCK_USER: 'unblock_user',
  DELETE_USER: 'delete_user',
};

// Async thunk pour charger les logs
export const fetchLogs = createAsyncThunk(
  'admin/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données simulées pour les logs
      const mockLogs = [
        {
          id: 1,
          user: 'Administrateur',
          action: 'Connexion au système',
          type: LOG_ACTION_TYPES.LOGIN,
          date: '2024-01-15 08:30:15',
          ip: '192.168.1.100',
        },
        {
          id: 2,
          user: 'Formateur Ahmed',
          action: 'Création d\'une nouvelle demande',
          type: LOG_ACTION_TYPES.CREATE,
          date: '2024-01-15 09:15:30',
          ip: '192.168.1.101',
        },
        {
          id: 3,
          user: 'Commission Fatima',
          action: 'Validation d\'une demande #123',
          type: LOG_ACTION_TYPES.UPDATE,
          date: '2024-01-15 10:45:22',
          ip: '192.168.1.102',
        },
        {
          id: 4,
          user: 'Administrateur',
          action: 'Création d\'un utilisateur',
          type: LOG_ACTION_TYPES.CREATE,
          date: '2024-01-15 11:20:05',
          ip: '192.168.1.100',
        },
        {
          id: 5,
          user: 'Administrateur',
          action: 'Déconnexion du système',
          type: LOG_ACTION_TYPES.LOGOUT,
          date: '2024-01-15 17:30:45',
          ip: '192.168.1.100',
        },
      ];
      
      return mockLogs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des logs');
    }
  }
);

const initialState = {
  logs: [],
  loading: false,
  error: null,
};

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    resetLogs: (state) => {
      state.logs = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectLogs = (state) => state.logs.logs || [];

export const { resetLogs } = logsSlice.actions;
export default logsSlice.reducer;