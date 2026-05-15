/**
 * src/routes/ProtectedRoute.jsx
 *
 * Protected route component for access control
 *
 * Features:
 * - Waits for auth check to complete (loading state)
 * - Redirects to login if not authenticated
 * - Validates user role and/or permissions against route requirements
 * - Redirects to correct dashboard if role is invalid
 * - No token logic - all auth from backend via cookies
 */

import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";
import { useToast } from "../shared/context/useToast";

/**
 * ProtectedRoute component
 *
 * Checks:
 * 1. Authentication status (wait for loading)
 * 2. User role against allowedRoles
 *
 * @param {React.ReactNode} children - Component to protect
 * @param {string[]} allowedRoles - Array of roles allowed (e.g., ['admin'])
 * @param {string[]} allowedPermissions - Array of permissions allowed (e.g., ['read_users'])
 */
const ProtectedRoute = ({ children, allowedRoles, allowedPermissions }) => {
  // Get auth state from context (not Redux)
  const { user, role, loading, isAuthenticated, can } = useAuth();
  const { info } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      info("Veuillez vous connecter pour accéder à cette page.");
    }
  }, [loading, isAuthenticated, user, info]);

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
      user: "/profile",
    };

    // If role is unknown, fallback to /profile or /dashboard instead of /login to avoid loop
    const redirectPath = dashboards[role] || "/profile";
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedPermissions && allowedPermissions.length > 0) {
    const allowed = allowedPermissions.some((permission) => can(permission));
    if (!allowed) {
      const redirectPath = role === "admin" ? "/admin" : role === "commission" ? "/commission" : role === "formateur" ? "/formateur" : "/profile";
      return <Navigate to={redirectPath} replace />;
    }
  }

  // All checks passed - render protected component
  return children;
};

export default ProtectedRoute;
