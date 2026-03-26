import axios from "axios";

const api = axios.create({
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// 🔥 VERY IMPORTANT
const getCsrfTokenFromCookie = () => {
  const name = "XSRF-TOKEN";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

api.interceptors.request.use((config) => {
  const csrfToken = getCsrfTokenFromCookie();
  
  if (csrfToken) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silence 401 noise for the check-auth endpoint
    if (error.response?.status === 401 && error.config.url.includes('/api/me')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403 && error.response?.data?.email_verification_required) {
      // Avoid infinite loops if already on verify page
      if (!window.location.pathname.includes('/verify-email')) {
        sessionStorage.setItem('verification_required', 'true');
        window.location.href = '/verify-email';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
