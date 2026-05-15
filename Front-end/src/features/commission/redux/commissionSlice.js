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

// Matches list (pairs)
export const fetchMatches = createAsyncThunk(
  'commission/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const pairs = await demandesApi.listMatches();
      // Map to a compact view for UI
      const mapped = pairs.map((p) => {
        const a = p.a || {};
        const b = p.b || {};
        const aUser = a.formateur?.user || {};
        const bUser = b.formateur?.user || {};
        const aFrom = a.formateur?.etablissement?.name || '—';
        const bFrom = b.formateur?.etablissement?.name || '—';
        const aTo = a.etablissement_souhaite?.name || '—';
        const bTo = b.etablissement_souhaite?.name || '—';
        const aSpecialite = a.formateur?.specialite || '—';
        const bSpecialite = b.formateur?.specialite || '—';
        return {
          aId: a.id,
          bId: b.id,
          aName: aUser.name || '—',
          bName: bUser.name || '—',
          aFrom, bFrom, aTo, bTo,
          aSpecialite,
          bSpecialite,
          aDate: a.date_soumission?.split('T')[0] || '',
          bDate: b.date_soumission?.split('T')[0] || '',
        };
      });
      return mapped;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des correspondances');
    }
  }
);

export const approveMatchPair = createAsyncThunk(
  'commission/approveMatchPair',
  async ({ aId, bId, commentaire }, { rejectWithValue }) => {
    try {
      const res = await demandesApi.approvePair({ aId, bId, commentaire });
      return { aId, bId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de validation de la paire');
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
      let data = [];
      try {
        const resp = await demandesApi.listDemandes(1, -1);
        data = resp.data || [];
      } catch (error) {
        if (error.response?.status !== 403) {
          throw error;
        }
      }

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
      let lastProcessedDemand = null;
      if (processed.length > 0) {
        const last = [...processed].sort(
          (a, b) => new Date(b.date_traitement) - new Date(a.date_traitement)
        )[0];
        const d = new Date(last.date_traitement);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        lastProcessedRequest = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        lastProcessedDemand = {
          id: last.id,
          status: last.etat?.key || last.etat?.code || '—',
          statusLabel: last.etat?.value?.libelle || last.etat?.key || last.etat?.code || '—',
          requesterName:
            last.formateur?.user?.name ??
            [last.formateur?.nom, last.formateur?.prenom].filter(Boolean).join(' ') ??
            '—',
          requesterEmail: last.formateur?.user?.email ?? '—',
          requesterEstablishment: last.formateur?.etablissement?.name ?? '—',
          targetEstablishment: last.etablissement_souhaite?.name ?? '—',
          targetCity: last.ville_souhaitee?.value?.libelle ?? last.ville_souhaitee?.key ?? '—',
          targetRegion: last.region_souhaitee?.value?.libelle ?? last.region_souhaitee?.key ?? '—',
          reviewerName: last.traitePar?.name ?? '—',
          reviewerEmail: last.traitePar?.email ?? '—',
          commentary: last.commentaire_commission ?? '',
          dateProcessed: last.date_traitement || null,
        };
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
        lastProcessedDemand,
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
  // Matches state
  matches: {
    data: [],
    loading: false,
    error: null,
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
        state.demandes.data = action.payload.data;
        state.demandes.meta = action.payload.meta;
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
      })
      // Matches reducers
      .addCase(fetchMatches.pending, (state) => {
        state.matches.loading = true;
        state.matches.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches.loading = false;
        state.matches.data = action.payload;
        state.matches.error = null;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.matches.loading = false;
        state.matches.error = action.payload;
      })
      .addCase(approveMatchPair.fulfilled, (state, action) => {
        const { aId, bId } = action.payload;
        // Remove approved pair from matches list
        state.matches.data = state.matches.data.filter(p => !(p.aId === aId && p.bId === bId) && !(p.aId === bId && p.bId === aId));
      });
  },
});

// ==================== SELECTORS ====================
// Demandes selectors
export const selectDemandes = (state) => state.commission.demandes.data;
export const selectDemandesLoading = (state) => state.commission.demandes.loading;
export const selectDemandesError = (state) => state.commission.demandes.error;
export const selectDemandesMeta = (state) => state.commission.demandes.meta;
export const selectEtatDemande = (state) => state.commission.demandes.etatDemande;

// Stats selectors
export const selectCommissionStats = (state) => state.commission.stats.data;
export const selectCommissionStatsLoading = (state) => state.commission.stats.loading;
export const selectCommissionStatsError = (state) => state.commission.stats.error;

// Matches selectors
export const selectMatches = (state) => state.commission.matches.data;
export const selectMatchesLoading = (state) => state.commission.matches.loading;
export const selectMatchesError = (state) => state.commission.matches.error;

// ==================== EXPORTS ====================
export const { resetCommission, resetDemandes, resetStats } = commissionSlice.actions;
export default commissionSlice.reducer;
