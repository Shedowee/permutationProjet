import api from "./api";

export const getCurrentEmploye = async () => {
  const res = await api.get("/api/employe/me", { withCredentials: true });
  return res.data.data;
};

