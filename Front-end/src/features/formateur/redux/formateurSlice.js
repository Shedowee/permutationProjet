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
  async ({ page = 1, limit = 4, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await demandesApi.listDemandes(page, limit, filters);
      const data = response.data ?? [];
      const meta = response.meta;

      const mapped = data.map((d) => ({
        id: d.id,
        utilisateurId: d.formateur?.user?.id ?? null,
        utilisateurNom:
          d.formateur?.user?.name ??
          [d.formateur?.nom, d.formateur?.prenom].filter(Boolean).join(' ') ??
          '—',
        utilisateurEmail: d.formateur?.user?.email ?? '—',
        utilisateurPhone: d.formateur?.user?.phone ?? '—',
        utilisateurAddress: d.formateur?.user?.address ?? '—',
        formateurEtablissement: d.formateur?.etablissement?.name ?? '—',
        formateurVille: d.formateur?.etablissement?.ville?.value?.libelle ?? d.formateur?.etablissement?.ville?.name ?? '—',
        formateurRegion: d.formateur?.etablissement?.ville?.region?.value?.libelle ?? d.formateur?.etablissement?.ville?.region?.name ?? '—',
        motif: d.motif ?? '',
        dateDemande: d.date_soumission?.split('T')[0] ?? '',
        dateDemandeComplete: d.date_soumission ?? null,
        etat: d.etat?.key ?? ETAT_DEMANDE.EN_ATTENTE,
        commentaire: d.commentaire_commission ?? '',
        dateValidation: d.date_traitement ?? null,
        traitePar: d.traitePar ?? d.traite_par ?? d.processedBy ?? d.processed_by ?? null,
        regionSouhaitee: d.region_souhaitee?.value?.libelle ?? d.region_souhaitee?.key ?? '—',
        villeSouhaitee: d.ville_souhaitee?.value?.libelle ?? d.ville_souhaitee?.key ?? '—',
        etablissementSouhaite: d.etablissement_souhaite?.name ?? '—',
        documentJoint: d.document_joint ?? null,
      }));

      for (const item of mapped) {
        const reviewer = item.traitePar || {};
        const reviewerFullName = [reviewer.prenom, reviewer.nom].filter(Boolean).join(' ');
        item.traiteParNom = reviewer.name || reviewer.nom || reviewerFullName || reviewer.full_name || reviewer.fullName || '—';
        item.traiteParEmail = reviewer.email || reviewer.mail || '—';
      }
      return { data: mapped, meta };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des demandes');
    }
  }
);

// Async thunk pour créer une demande
export const createDemande = createAsyncThunk(
  'formateur/createDemande',
  async (formData, { rejectWithValue }) => {
    try {
      const created = await demandesApi.createDemande(formData);
      return {
        id: created.id,
        utilisateurId: created.formateur_id,
        utilisateurNom: 'Moi',
        utilisateurEmail: '',
        utilisateurPhone: '',
        utilisateurAddress: '',
        formateurEtablissement: '',
        formateurVille: '',
        formateurRegion: '',
        motif: created.motif ?? '',
        dateDemande: (created.date_soumission || '').split('T')[0],
        etat: ETAT_DEMANDE.EN_ATTENTE,
        commentaire: '',
        dateValidation: null,
        aiRecommendations: created.ai_recommendations ?? created.aiRecommendations ?? [],
      };
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || 'Erreur de création de la demande',
      });
    }
  }
);

// ==================== STATISTIQUES ====================
// Async thunk pour charger les statistiques du formateur
export const fetchFormateurStats = createAsyncThunk(
  'formateur/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // Get all requests for stats calculation
      const response = await demandesApi.listDemandes(1, -1, { scope: 'mine' });
      const data = response.data || [];

      const totalRequests = data.length;
      const pendingRequests = data.filter(
        (d) => d.etat && d.etat.key === ETAT_DEMANDE.EN_ATTENTE
      ).length;
      const validatedRequests = data.filter(
        (d) => d.etat && d.etat.key === ETAT_DEMANDE.VALIDE
      ).length;
      const rejectedRequests = data.filter(
        (d) => d.etat && d.etat.key === ETAT_DEMANDE.REFUSE
      ).length;

      let lastRequestStatus = null;
      let lastRequestDate = null;
      let lastRequestMotif = '';
      let lastRequestLocation = '';

      if (data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          const da = a.date_soumission ? new Date(a.date_soumission) : 0;
          const db = b.date_soumission ? new Date(b.date_soumission) : 0;
          return db - da;
        });
        const last = sorted[0];
        lastRequestStatus = last.etat?.key || null;
        lastRequestDate = last.date_soumission ? last.date_soumission.split('T')[0] : null;
        lastRequestMotif = last.motif || '';

        const region = last.region_souhaitee?.value?.libelle || last.region_souhaitee?.key || '';
        const ville = last.ville_souhaitee?.value?.libelle || last.ville_souhaitee?.key || '';
        if (region && ville) {
          lastRequestLocation = `${region} → ${ville}`;
        } else if (region || ville) {
          lastRequestLocation = region || ville;
        }
      }

      const successRate = totalRequests > 0 ? Math.round((validatedRequests / totalRequests) * 100) : 0;

      return {
        totalRequests,
        pendingRequests,
        validatedRequests,
        rejectedRequests,
        lastRequestStatus,
        lastRequestDate,
        lastRequestMotif,
        lastRequestLocation,
        successRate,
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
    meta: null,
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
        state.demandes.data = action.payload.data;
        state.demandes.meta = action.payload.meta;
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
        state.demandes.error = action.payload?.message ?? action.payload;
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
export const selectDemandesMeta = (state) => state.formateur.demandes.meta;
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
