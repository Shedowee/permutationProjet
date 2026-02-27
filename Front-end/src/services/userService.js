import api from "./api";

export const updateProfile = async (data) => {
  const response = await api.put("/api/user/profile", data);
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await api.put("/api/user/password", data);
  return response.data;
};

export const updateEmail = async (email) => {
  const response = await api.put("/api/user/email", { email });
  return response.data;
};

export const verifyNewEmail = async (data) => {
  const response = await api.post("/api/user/email/verify", data);
  return response.data;
};

export const getNotifications = async (page = 1) => {
  const response = await api.get(`/api/notifications?page=${page}`);
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/api/notifications/${id}/read`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get("/api/notifications/unread-count");
  return response.data;
};
