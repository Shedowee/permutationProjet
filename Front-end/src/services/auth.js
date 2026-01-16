// Authentication service using API
import apiService from './api';

export const login = async (username, password) => {
  return await apiService.login(username, password);
};

export const logout = () => {
  // Clear any stored tokens
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  return { success: true };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('adminUser');
  return userData ? JSON.parse(userData) : null;
};
