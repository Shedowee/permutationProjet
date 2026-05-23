import api from "./api";

const mapLogFromApi = (l) => ({
  id: l.id,
  user: l.user || "—",
  action: l.action || "",
  type: l.type || "view",
  date: l.date || "",
  ip: l.ip || "",
  table: l.table || "",
  record_id: l.record_id || null,
  before: l.before || null,
  after: l.after || null,
});

export const listLogs = async ({ q, type, date, page = 1, limit = 5 } = {}) => {
  const params = { page, limit };
  if (q) params.q = q;
  if (type) params.type = type;
  if (date) params.date = date;

  const res = await api.get("/api/admin/logs", { params, withCredentials: true });
  const data = res.data?.data ?? [];
  const meta = res.data?.meta;
  return {
    data: data.map(mapLogFromApi),
    meta
  };
};

export const getLog = async (id) => {
  const res = await api.get(`/api/admin/logs/${id}`, { withCredentials: true });
  return res.data?.data;
};
