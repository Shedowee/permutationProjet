import api from "./api";

export const listRoles = async () => {
  const res = await api.get("/api/roles", { withCredentials: true });
  const roles = res.data?.data ?? [];
  return roles.map((r) => ({
    id: r.id,
    value: String(r.code || r.name || "").toLowerCase(),
    label: r.name || r.code || "",
    categoryId: r.role_category_id ?? null,
    permissions: (r.permissions || []).map((permission) => permission.name),
  }));
};

export const listPermissions = async () => {
  const res = await api.get("/api/permissions", { withCredentials: true });
  return res.data?.data ?? [];
};

export const updateRolePermissions = async (roleId, permissions) => {
  const res = await api.patch(
    `/api/roles/${roleId}/permissions`,
    { permissions },
    { withCredentials: true }
  );
  return res.data?.data;
};
