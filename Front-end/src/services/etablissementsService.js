import api from "./api";

export const listEtablissementsByCity = async (cityId) => {
  const res = await api.get(`/api/etablissements/cities/${cityId}`, { withCredentials: true });
  return res.data.data;
};

