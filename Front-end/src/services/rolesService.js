import api from "./api";

export const listRoles = async () => {
  const res = await api.get("/api/roles", { withCredentials: true });
  return res.data.data;
};

