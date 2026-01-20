import React, { useState, useEffect } from "react";
import * as authService from "../../services/authService";
import { AuthContext } from "./AuthContextBase";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeRole = (r) => {
    if (!r) return null;
    const v = String(r).toLowerCase();
    if (v === "comission") return "commission";
    return v;
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRole(normalizeRole(data.user?.role));
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login(credentials);
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRole(normalizeRole(data.user?.role));
      return data.user;
    } catch (err) {
      setError(err.message || "Login failed");
      setUser(null);
      setRole(null);
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
      setError(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
