import api from "./api";

export const listRoles = async () => {
  const res = await api.get("/api/roles", { withCredentials: true });
  const roles = res.data?.data ?? [];
  return roles.map((r) => ({
    id: r.id,
    value: String(r.code || "").toLowerCase(),
    label: r.libelle || r.code || "",
    categoryId: r.role_category_id ?? null,
  }));
};

