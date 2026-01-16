// src/features/commission/redux/commissionSlice.js
// Slice Redux pour les fonctionnalités commission
// Gère le traitement des demandes et les statistiques de la commission

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données simulées
      const mockDemandes = [
        {
          id: 1,
          utilisateurId: 3,
          utilisateurNom: 'Ahmed Mohamed',
          utilisateurEmail: 'ahmed@ofppt.ma',
          motif: 'Problème familial',
          dateDemande: '2024-01-15',
          dateDebut: '2024-02-01',
          dateFin: '2024-02-15',
          etat: ETAT_DEMANDE.EN_ATTENTE,
          commentaire: '',
          dateValidation: null,
        },
        {
          id: 2,
          utilisateurId: 4,
          utilisateurNom: 'Fatima Karim',
          utilisateurEmail: 'fatima@ofppt.ma',
          motif: 'Santé',
          dateDemande: '2024-01-14',
          dateDebut: '2024-01-20',
          dateFin: '2024-01-25',
          etat: ETAT_DEMANDE.VALIDE,
          commentaire: 'Demande validée par la commission',
          dateValidation: '2024-01-15',
        },
        {
          id: 3,
          utilisateurId: 5,
          utilisateurNom: 'Youssef Tahiri',
          utilisateurEmail: 'youssef@ofppt.ma',
          motif: 'Vacances',
          dateDemande: '2024-01-13',
          dateDebut: '2024-02-10',
          dateFin: '2024-02-20',
          etat: ETAT_DEMANDE.REFUSE,
          commentaire: 'Période de congés non autorisée',
          dateValidation: '2024-01-14',
        },
      ];
      
      return mockDemandes;
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
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const demandeTraitee = {
        id,
        etat,
        commentaire,
        dateValidation: new Date().toISOString().split('T')[0],
      };
      
      return demandeTraitee;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de traitement de la demande');
    }
  }
);

// ==================== STATISTIQUES ====================
// Async thunk pour charger les statistiques de la commission
export const fetchCommissionStats = createAsyncThunk(
  'commission/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stats = {
        totalRequests: 42,
        pendingRequests: 8,
        validatedRequests: 25,
        rejectedRequests: 9,
        processingRate: 81,
        avgProcessingTime: '2.3 jours',
        lastProcessedRequest: 'Hier à 14h30',
      };
      
      return stats;
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
        state.demandes.error = action.payload;
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