import api from "./api";

export const listEtablissements = async () => {
  const res = await api.get("/api/etablissements", { withCredentials: true });
  return res.data.data;
};

