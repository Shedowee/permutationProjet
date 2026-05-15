import api from "./api";

export const getCurrentFormateur = async () => {
  const res = await api.get("/api/formateur/me", { withCredentials: true });
  return res.data.data;
};
