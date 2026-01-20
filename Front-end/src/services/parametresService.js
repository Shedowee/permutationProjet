import api from "./api";

export const getParametres = async (type) => {
  const res = await api.get("/api/parametres", {
    params: { type },
    withCredentials: true,
  });
  return res.data.data;
};

