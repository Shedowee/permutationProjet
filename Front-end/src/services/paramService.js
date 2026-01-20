import api from "./api";

export const listParametres = async ({ type } = {}) => {
  const params = {};
  if (type) params.type = type;
  const res = await api.get("/api/parametres", { params, withCredentials: true });
  return res.data?.data ?? [];
};

export const listUserStatuses = async () => {
  const items = await listParametres({ type: "STATUT_USER" });
  return items.map((p) => ({
    value: String(p.code || "").toLowerCase(),
    label: p.libelle || p.code || "",
  }));
};

