import api from "./api";

export const getCsrfCookie = async () => {
  await api.get("/sanctum/csrf-cookie");
};

export const login = async ({ email, password }) => {
  await getCsrfCookie(); // 🔥 REQUIRED
  try {
    const response = await api.post(
      "/api/login",
      { email, password },
      { withCredentials: true },
    );
    return response.data;
  } catch (err) {
    const status = err?.response?.status;
    const raw = err?.response?.data?.message || err?.message;
    const data = err?.response?.data || {};
    let message = raw || "Une erreur est survenue";
    if (status === 401) message = "Identifiant ou mot de passe incorrect.";
    else if (status === 403) message = raw || "Accès refusé. Compte suspendu ou non autorisé.";
    else if (status === 422) message = raw || "Données invalides.";
    else if (!err?.response) message = "Impossible de contacter le serveur. Vérifiez votre connexion.";
    const e = new Error(message);
    e.response = err?.response;
    e.status = status;
    e.code = data.error_code || null;
    e.field = data.field || null;
    e.data = data;
    throw e;
  }
};

export const logout = async () => {
  await api.post("/api/logout", {}, { withCredentials: true });
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/me", { withCredentials: true });
  return response.data;
};

export const signup = async ({ name, email, password }) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/signup",
    { name, email, password },
    { withCredentials: true }
  );
  return response.data;
};

export const resendVerificationLink = async (email) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/resend-verification-link",
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

export const resetPassword = async (data) => {
  await getCsrfCookie();
  const response = await api.post(
    "/api/reset-password",
    data,
    { withCredentials: true }
  );
  return response.data;
};
