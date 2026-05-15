import api from "./api";

export const listParametres = async ({ type, include_inactive, parent_id } = {}) => {
  const params = {};
  if (type) params.type = type;
  if (include_inactive) params.include_inactive = include_inactive;
  if (parent_id) params.parent_id = parent_id;
  const res = await api.get("/api/parametres", { params, withCredentials: true });
  return res.data?.data ?? [];
};

export const listCitiesByRegion = async (regionId) => {
  if (!regionId) return [];
  const params = { type: "VILLE", parent_id: regionId, include_inactive: true };
  const res = await api.get("/api/parametres", { params, withCredentials: true });
  return res.data?.data ?? [];
};

export const createParametre = async (data) => {
  const res = await api.post("/api/parametres", data, { withCredentials: true });
  return res.data;
};

export const updateParametre = async (id, data) => {
  const res = await api.put(`/api/parametres/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteParametre = async (id) => {
  const res = await api.delete(`/api/parametres/${id}`, { withCredentials: true });
  return res.data;
};

export const listUserStatuses = async () => {
  const items = await listParametres({ type: "STATUT_USER" });
  return items.map((p) => ({
    value: String(p.key || "").toLowerCase(),
    label: p.value?.libelle || p.key || "",
  }));
};
