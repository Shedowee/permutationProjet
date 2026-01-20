// src/features/admin/redux/logsSlice.js
// Slice Redux pour la gestion des logs dans la section admin
// Gère l'affichage et la recherche des logs système

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as logsApi from '../../../services/logsService';

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
      const logs = await logsApi.listLogs();
      return logs;
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
