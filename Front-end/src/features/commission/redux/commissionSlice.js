// src/features/commission/redux/commissionSlice.js
// Slice Redux pour les fonctionnalités commission
// Gère le traitement des demandes et les statistiques de la commission

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as demandesApi from '../../../services/demandesService';

// États possibles pour une demande
const ETAT_DEMANDE = {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDE: 'VALIDE',
  REFUSE: 'REFUSE',
};

// ==================== DEMANDES MANAGEMENT ====================
// Async thunk pour charger les demandes (réutilise le même que formateur)
export const fetchDemandes = createAsyncThunk(
  'commission/fetchDemandes',
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

// Async thunk pour traiter une demande (valider/refuser)
export const traiterDemande = createAsyncThunk(
  'commission/traiterDemande',
  async ({ id, etat, commentaire }, { rejectWithValue }) => {
    try {
      const updated = await demandesApi.traiterDemande({
        id,
        etatCode: etat,
        commentaire,
      });
      return {
        id: updated.id,
        etat: updated.etat?.code ?? etat,
        commentaire: updated.commentaire_commission ?? commentaire,
        dateValidation: (updated.date_traitement || '').split('T')[0],
      };
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || 'Erreur de traitement de la demande',
      });
    }
  }
);

// ==================== STATISTIQUES ====================
// Async thunk pour charger les statistiques de la commission
export const fetchCommissionStats = createAsyncThunk(
  'commission/fetchStats',
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

      const processed = data.filter((d) => d.date_traitement);
      let avgProcessingTime = '—';
      if (processed.length > 0) {
        const diffs = processed
          .map((d) => {
            const start = d.date_soumission ? new Date(d.date_soumission) : null;
            const end = new Date(d.date_traitement);
            if (!start || !end) return null;
            return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
          })
          .filter((x) => x !== null);
        if (diffs.length > 0) {
          const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          avgProcessingTime = `${avg.toFixed(1)} jours`;
        }
      }

      let lastProcessedRequest = '—';
      if (processed.length > 0) {
        const last = processed.sort(
          (a, b) => new Date(b.date_traitement) - new Date(a.date_traitement)
        )[0];
        const d = new Date(last.date_traitement);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        lastProcessedRequest = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      }

      const processingRate =
        totalRequests > 0 ? Math.round(((validatedRequests + rejectedRequests) / totalRequests) * 100) : 0;

      return {
        totalRequests,
        pendingRequests,
        validatedRequests,
        rejectedRequests,
        processingRate,
        avgProcessingTime,
        lastProcessedRequest,
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
const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    // Reset all commission state
    resetCommission: (state) => {
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
      .addCase(traiterDemande.pending, (state) => {
        state.demandes.loading = true;
        state.demandes.error = null;
      })
      .addCase(traiterDemande.fulfilled, (state, action) => {
        state.demandes.loading = false;
        const index = state.demandes.data.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.demandes.data[index].etat = action.payload.etat;
          state.demandes.data[index].commentaire = action.payload.commentaire;
          state.demandes.data[index].dateValidation = action.payload.dateValidation;
        }
        state.demandes.error = null;
      })
      .addCase(traiterDemande.rejected, (state, action) => {
        state.demandes.loading = false;
        state.demandes.error = action.payload?.message ?? action.payload;
      })
      
      // Stats reducers
      .addCase(fetchCommissionStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchCommissionStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
        state.stats.error = null;
      })
      .addCase(fetchCommissionStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      });
  },
});

// ==================== SELECTORS ====================
// Demandes selectors
export const selectDemandes = (state) => state.commission.demandes.data;
export const selectDemandesLoading = (state) => state.commission.demandes.loading;
export const selectDemandesError = (state) => state.commission.demandes.error;
export const selectEtatDemande = (state) => state.commission.demandes.etatDemande;

// Stats selectors
export const selectCommissionStats = (state) => state.commission.stats.data;
export const selectCommissionStatsLoading = (state) => state.commission.stats.loading;
export const selectCommissionStatsError = (state) => state.commission.stats.error;

// ==================== EXPORTS ====================
export const { resetCommission, resetDemandes, resetStats } = commissionSlice.actions;
export default commissionSlice.reducer;
