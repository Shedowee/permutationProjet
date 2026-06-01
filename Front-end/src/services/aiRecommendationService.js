import api from "./api";

export const listAiRecommendations = async (params = {}) => {
  const response = await api.get("/api/ai/recommendations", { params });
  return response.data?.data || [];
};

export const triggerAiScan = async (demandeId) => {
  const response = await api.post(`/api/ai/demandes/${demandeId}/scan`);
  return response.data?.data || [];
};

export const acceptAiRecommendation = async (recommendationId) => {
  const response = await api.post(`/api/ai/recommendations/${recommendationId}/accept`);
  return response.data?.data;
};

export const refuseAiRecommendation = async (recommendationId) => {
  const response = await api.post(`/api/ai/recommendations/${recommendationId}/refuse`);
  return response.data?.data;
};

