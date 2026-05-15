import React, { useState, useEffect } from "react";
import * as authService from "../../services/authService";
import { AuthContext } from "./AuthContextBase";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeRole = (r) => {
    if (!r) return null;
    return String(r).toLowerCase();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const extractPermissions = (data) => data?.user?.permissions || [];

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      setUser(data.user);
      const userRole = data.user?.role || null;
      setRole(normalizeRole(userRole));
      setPermissions(extractPermissions(data));
    } catch {
      setUser(null);
      setRole(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      const userRole = data.user?.role || null;
      setRole(normalizeRole(userRole));
      setPermissions(extractPermissions(data));
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login(credentials);
      const data = await authService.getCurrentUser();
      setUser(data.user);
      const userRole = data.user?.role || null;
      setRole(normalizeRole(userRole));
      setPermissions(extractPermissions(data));
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      setError(message);
      setUser(null);
      setRole(null);
      setPermissions([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch {
      console.warn("Logout failed");
    } finally {
      setUser(null);
      setRole(null);
      setPermissions([]);
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const can = (permission) => permissions.includes(permission);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        can,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
