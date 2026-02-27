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
  await api.post("/api/logout", {}, { withCredentials: true });
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/me", { withCredentials: true });
  return response.data;
};

export const signup = async ({ nom, email, password }) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/signup",
    { nom, email, password },
    { withCredentials: true }
  );
  return response.data;
};

export const confirmAccount = async ({ email, code }) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/confirm",
    { email, code },
    { withCredentials: true }
  );
  return response.data;
};

export const resendCode = async (email) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/resend-code",
    { email },
    { withCredentials: true }
  );
  return response.data;
};

export const forgotPassword = async (email) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/forgot-password",
    { email },
    { withCredentials: true }
  );
  return response.data;
};

export const resendVerificationEmail = async () => {
  const response = await api.post("/api/email/resend", {}, { withCredentials: true });
  return response.data;
};

export const verifyEmailOtp = async (code) => {
  const response = await api.post("/api/email/verify", { code }, { withCredentials: true });
  return response.data;
};

export const resetPassword = async (data) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/reset-password",
    data,
    { withCredentials: true }
  );
  return response.data;
};
