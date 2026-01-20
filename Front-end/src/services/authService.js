import api from "./api";

export const getCsrfCookie = async () => {
  await api.get("/sanctum/csrf-cookie");
};

export const login = async ({ email, password }) => {
  await getCsrfCookie(); // 🔥 REQUIRED
  const response = await api.post(
    "/api/login",
    { email, password },
    { withCredentials: true },
  );
  return response.data;
};

export const logout = async () => {
  await api.post("/api/logout");
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/me");
  return response.data;
};
