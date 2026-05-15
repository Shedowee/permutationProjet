import api from "./api";

export const listDemandes = async (page = 1, limit = 4, filters = {}) => {
  const params = { page, limit };
  if (filters.search) params.search = filters.search;
  if (filters.etat) params.etat = filters.etat;
  if (filters.region_id) params.region_id = filters.region_id;
  if (filters.ville_id) params.ville_id = filters.ville_id;
  if (filters.etablissement_id) params.etablissement_id = filters.etablissement_id;
  if (filters.scope) params.scope = filters.scope; // 'mine' | 'market'
  if (filters.looking_for_me) params.looking_for_me = true;
  const res = await api.get("/api/demandes", {
    params,
    withCredentials: true
  });
  return res.data;
};

export const createDemande = async (formData) => {
  const res = await api.post("/api/demandes", formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};

export const traiterDemande = async ({ id, etatCode, commentaire }) => {
  const payload = {
    etat_code: etatCode,
    commentaire_commission: commentaire || null,
  };
  const res = await api.put(`/api/demandes/${id}`, payload, { withCredentials: true });
  return res.data.data;
};

export const updateDemande = async (id, formData) => {
  const payload = formData instanceof FormData ? formData : new FormData();
  if (payload instanceof FormData && !payload.has('_method')) {
    payload.append('_method', 'PUT');
  }

  const res = await api.post(`/api/demandes/${id}`, payload, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};

export const deleteDemande = async (id) => {
  const res = await api.delete(`/api/demandes/${id}`, { withCredentials: true });
  return res.data;
};

export const getDemande = async (id) => {
  const res = await api.get(`/api/demandes/${id}`, { withCredentials: true });
  return res.data.data;
};

export const listMatches = async () => {
  const res = await api.get('/api/demandes/matches', { withCredentials: true });
  return res.data?.data ?? [];
};

export const approvePair = async ({ aId, bId, commentaire = '' }) => {
  // Validate A then B; if second fails, caller can handle rollback if needed
  const first = await traiterDemande({ id: aId, etatCode: 'VALIDE', commentaire });
  const second = await traiterDemande({ id: bId, etatCode: 'VALIDE', commentaire });
  return { first, second };
};
