/**
 * src/routes/GuestRoute.jsx
 *
 * Prevents authenticated users from accessing guest-only routes (login, signup)
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";

const GuestRoute = ({ children }) => {
  const { role, loading, isAuthenticated } = useAuth();

  // Wait for initial auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600 font-bold uppercase tracking-widest text-xs">Chargement...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    const dashboards = {
      admin: "/admin",
      commission: "/commission",
      formateur: "/formateur",
      employe: "/employe",
    };

    const redirectPath = dashboards[role] || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // Not authenticated - allow access to guest route
  return children;
};

export default GuestRoute;
