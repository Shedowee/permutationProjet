import api from "./api";

export const listDemandes = async () => {
  const res = await api.get("/api/demandes", { withCredentials: true });
  return res.data.data;
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

