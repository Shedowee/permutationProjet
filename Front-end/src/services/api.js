import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // ✅ critical for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Optional: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request - user is not authenticated");
    }
    return Promise.reject(error);
  }
);

export default api;
