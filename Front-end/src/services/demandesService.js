import api from "./api";

export const listDemandes = async () => {
  const res = await api.get("/api/demandes", { withCredentials: true });
  return res.data.data;
};

export const createDemande = async ({ motif, regionSouhaiteeId, etablissementSouhaiteId }) => {
  const payload = {
    motif,
    region_souhaitee_id: regionSouhaiteeId || null,
    etablissement_souhaite_id: etablissementSouhaiteId || null,
  };
  const res = await api.post("/api/demandes", payload, { withCredentials: true });
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

