import api from "./api";

/**
 * Fetch CSRF cookie - MUST be called before login
 */
export const getCsrfCookie = async () => {
  await api.get("/sanctum/csrf-cookie");
};

/**
 * Login with email/password
 */
export const login = async ({ email, password }) => {
  await getCsrfCookie();
  const response = await api.post("/api/login", { email, password });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  await api.post("/api/logout");
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const response = await api.get("/api/me");
  return response.data;
};
