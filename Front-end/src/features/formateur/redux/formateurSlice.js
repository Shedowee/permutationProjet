// src/features/formateur/redux/formateurSlice.js
// Slice Redux pour les fonctionnalités formateur
// Gère les demandes de permutation et les statistiques du formateur

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Données simulées
      const mockDemandes = [
        {
          id: 1,
          utilisateurId: 3,
          utilisateurNom: 'Youssef Tahiri',
          utilisateurEmail: 'youssef@ofppt.ma',
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
          utilisateurId: 3,
          utilisateurNom: 'Youssef Tahiri',
          utilisateurEmail: 'youssef@ofppt.ma',
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
          utilisateurId: 4,
          utilisateurNom: 'Sara El Mansouri',
          utilisateurEmail: 'sara@ofppt.ma',
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

// Async thunk pour créer une demande
export const createDemande = createAsyncThunk(
  'formateur/createDemande',
  async (demandeData, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nouvelleDemande = {
        id: Date.now(), // ID temporaire
        utilisateurId: demandeData.utilisateurId,
        utilisateurNom: demandeData.utilisateurNom,
        utilisateurEmail: demandeData.utilisateurEmail,
        motif: demandeData.motif,
        dateDemande: new Date().toISOString().split('T')[0],
        dateDebut: demandeData.dateDebut,
        dateFin: demandeData.dateFin,
        etat: ETAT_DEMANDE.EN_ATTENTE,
        commentaire: '',
        dateValidation: null,
      };
      
      return nouvelleDemande;
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stats = {
        totalRequests: 12,
        pendingRequests: 3,
        validatedRequests: 7,
        rejectedRequests: 2,
        lastRequestStatus: 'VALIDE',
        lastRequestDate: '2024-01-15',
        lastRequestMotif: 'Congés annuels',
        lastRequestDates: '15-20 Janvier 2024',
        successRate: 58.3,
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