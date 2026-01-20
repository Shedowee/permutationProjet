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
  await getCsrfCookie();
  await api.post("/api/logout", {}, { withCredentials: true });
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/me", { withCredentials: true });
  return response.data;
};
