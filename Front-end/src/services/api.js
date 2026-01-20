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

export default api;
