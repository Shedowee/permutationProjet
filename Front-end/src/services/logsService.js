import api from "./api";

const mapLogFromApi = (l) => ({
  id: l.id,
  user: l.user || "—",
  action: l.action || "",
  type: l.type || "view",
  date: l.date || "",
  ip: l.ip || "",
});

export const listLogs = async ({ q, type, date } = {}) => {
  const params = {};
  if (q) params.q = q;
  if (type) params.type = type;
  if (date) params.date = date;

  const res = await api.get("/api/logs", { params, withCredentials: true });
  const data = res.data?.data ?? [];
  return data.map(mapLogFromApi);
};

export const getLog = async (id) => {
  const res = await api.get(`/api/logs/${id}`, { withCredentials: true });
  return res.data?.data;
};

