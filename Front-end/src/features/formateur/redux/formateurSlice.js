// src/features/formateur/redux/formateurSlice.js
// Slice Redux pour les fonctionnalités formateur
// Gère les demandes de permutation et les statistiques du formateur

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as demandesApi from '../../../services/demandesService';

// États possibles pour une demande
const ETAT_DEMANDE = {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDE: 'VALIDE',
  REFUSE: 'REFUSE',
};

// ==================== DEMANDES MANAGEMENT ====================
// Async thunk pour charger les demandes
export const fetchDemandes = createAsyncThunk(
  'formateur/fetchDemandes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await demandesApi.listDemandes();
      const mapped = data.map((d) => ({
        id: d.id,
        utilisateurId: d.employe?.user?.id ?? null,
        utilisateurNom:
          d.employe?.user?.nom ??
          [d.employe?.nom, d.employe?.prenom].filter(Boolean).join(' ') ??
          '—',
        utilisateurEmail: d.employe?.user?.email ?? '—',
        motif: d.motif ?? '',
        dateDemande: d.date_soumission?.split('T')[0] ?? '',
        etat: d.etat?.code ?? ETAT_DEMANDE.EN_ATTENTE,
        commentaire: d.commentaire_commission ?? '',
        dateValidation: d.date_traitement ?? null,
      }));
      return mapped;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des demandes');
    }
  }
);

// Async thunk pour créer une demande
export const createDemande = createAsyncThunk(
  'formateur/createDemande',
  async (demandeData, { rejectWithValue }) => {
    try {
      const created = await demandesApi.createDemande({
        motif: demandeData.motif,
        regionSouhaiteeId: demandeData.regionSouhaiteeId,
        etablissementSouhaiteId: demandeData.etablissementSouhaiteId,
      });
      return {
        id: created.id,
        utilisateurId: created.employe_id,
        utilisateurNom: 'Moi',
        utilisateurEmail: '',
        motif: created.motif ?? '',
        dateDemande: (created.date_soumission || '').split('T')[0],
        etat: ETAT_DEMANDE.EN_ATTENTE,
        commentaire: '',
        dateValidation: null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de création de la demande');
    }
  }
);

// ==================== STATISTIQUES ====================
// Async thunk pour charger les statistiques du formateur
export const fetchFormateurStats = createAsyncThunk(
  'formateur/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await demandesApi.listDemandes();

      const totalRequests = data.length;
      const pendingRequests = data.filter(
        (d) => d.etat && d.etat.code === ETAT_DEMANDE.EN_ATTENTE
      ).length;
      const validatedRequests = data.filter(
        (d) => d.etat && d.etat.code === ETAT_DEMANDE.VALIDE
      ).length;
      const rejectedRequests = data.filter(
        (d) => d.etat && d.etat.code === ETAT_DEMANDE.REFUSE
      ).length;

      let lastRequestStatus = null;
      let lastRequestDate = null;
      let lastRequestMotif = '';
      let lastRequestDates = '';

      if (data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          const da = a.date_soumission ? new Date(a.date_soumission) : 0;
          const db = b.date_soumission ? new Date(b.date_soumission) : 0;
          return db - da;
        });
        const last = sorted[0];
        lastRequestStatus = last.etat ? last.etat.code : null;
        lastRequestDate = last.date_soumission
          ? last.date_soumission.split('T')[0]
          : null;
        lastRequestMotif = last.motif || '';
        lastRequestDates = lastRequestDate || '';
      }

      const successRate =
        totalRequests > 0 ? (validatedRequests / totalRequests) * 100 : 0;

      return {
        totalRequests,
        pendingRequests,
        validatedRequests,
        rejectedRequests,
        lastRequestStatus,
        lastRequestDate,
        lastRequestMotif,
        lastRequestDates,
        successRate: Number(successRate.toFixed(1)),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des statistiques');
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  // Demandes state
  demandes: {
    data: [],
    loading: false,
    error: null,
    etatDemande: ETAT_DEMANDE,
  },
  
  // Statistiques state
  stats: {
    data: null,
    loading: false,
    error: null,
  }
};

// ==================== SLICE DEFINITION ====================
const formateurSlice = createSlice({
  name: 'formateur',
  initialState,
  reducers: {
    // Reset all formateur state
    resetFormateur: (state) => {
      state.demandes.data = [];
      state.demandes.loading = false;
      state.demandes.error = null;
      state.stats.data = null;
      state.stats.loading = false;
      state.stats.error = null;
    },
    
    // Reset demandes state
    resetDemandes: (state) => {
      state.demandes.data = [];
      state.demandes.loading = false;
      state.demandes.error = null;
    },
    
    // Reset stats state
    resetStats: (state) => {
      state.stats.data = null;
      state.stats.loading = false;
      state.stats.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Demandes reducers
      .addCase(fetchDemandes.pending, (state) => {
        state.demandes.loading = true;
        state.demandes.error = null;
      })
      .addCase(fetchDemandes.fulfilled, (state, action) => {
        state.demandes.loading = false;
        state.demandes.data = action.payload;
        state.demandes.error = null;
      })
      .addCase(fetchDemandes.rejected, (state, action) => {
        state.demandes.loading = false;
        state.demandes.error = action.payload;
      })
      .addCase(createDemande.pending, (state) => {
        state.demandes.loading = true;
        state.demandes.error = null;
      })
      .addCase(createDemande.fulfilled, (state, action) => {
        state.demandes.loading = false;
        state.demandes.data.unshift(action.payload);
        state.demandes.error = null;
      })
      .addCase(createDemande.rejected, (state, action) => {
        state.demandes.loading = false;
        state.demandes.error = action.payload;
      })
      
      // Stats reducers
      .addCase(fetchFormateurStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchFormateurStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
        state.stats.error = null;
      })
      .addCase(fetchFormateurStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      });
  },
});

// ==================== SELECTORS ====================
// Demandes selectors
export const selectDemandes = (state) => state.formateur.demandes.data;
export const selectDemandesLoading = (state) => state.formateur.demandes.loading;
export const selectDemandesError = (state) => state.formateur.demandes.error;
export const selectEtatDemande = (state) => state.formateur.demandes.etatDemande;

// Stats selectors
export const selectFormateurStats = (state) => state.formateur.stats.data;
export const selectFormateurStatsLoading = (state) => state.formateur.stats.loading;
export const selectFormateurStatsError = (state) => state.formateur.stats.error;

// ==================== EXPORTS ====================
export const { resetFormateur, resetDemandes, resetStats } = formateurSlice.actions;
export default formateurSlice.reducer;
