/**
 * src/routes/ProtectedRoute.jsx
 *
 * Protected route component for role-based access control
 *
 * Features:
 * - Waits for auth check to complete (loading state)
 * - Redirects to login if not authenticated
 * - Validates user role against allowedRoles
 * - Redirects to correct dashboard if role is invalid
 * - No token logic - all auth from backend via cookies
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";

/**
 * ProtectedRoute component
 *
 * Checks:
 * 1. Authentication status (wait for loading)
 * 2. User role against allowedRoles
 *
 * @param {React.ReactNode} children - Component to protect
 * @param {string[]} allowedRoles - Array of roles allowed (e.g., ['admin'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get auth state from context (not Redux)
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Wait for initial auth check to complete
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permission
  if (allowedRoles && !allowedRoles.includes(role)) {
    // User has wrong role - redirect to appropriate dashboard
    const dashboards = {
      admin: "/admin",
      commission: "/commission",
      formateur: "/formateur",
    };

    const redirectPath = dashboards[role] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed - render protected component
  return children;
};

export default ProtectedRoute;
