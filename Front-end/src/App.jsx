/**
 * src/App.jsx
 *
 * Main app with routing and authentication
 *
 * Authentication is managed by AuthContext (not Redux)
 * AuthContext checks /api/me on app load via AuthProvider
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./auth/context/AuthContext";

// Pages
import Login from "./auth/pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminDashboard from "./features/admin/pages/AdminDashboard";
import UserManagement from "./features/admin/pages/UserManagement";
import AssignRoles from "./features/admin/pages/AssignRoles";
import ViewLogs from "./features/admin/pages/ViewLogs";
import EtablissementManagement from "./features/admin/pages/EtablissementManagement";

import CommissionDashboard from "./features/commission/pages/CommissionDashboard";
import CommissionDemandesManagement from "./features/commission/pages/DemandesManagement";

import FormateurDashboard from "./features/formateur/pages/FormateurDashboard";
import FormateurDemandesManagement from "./features/formateur/pages/DemandesManagement";
import CreateDemande from "./features/formateur/pages/CreateDemande";

const App = () => {
  // Auth is managed by AuthContext, not Redux
  // Loading state is handled by ProtectedRoute
  const { loading } = useAuth();

  // Wait for initial auth check
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

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssignRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/etablissements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EtablissementManagement />
            </ProtectedRoute>
          }
        />

        {/* Commission Routes */}
        <Route
          path="/commission"
          element={
            <ProtectedRoute allowedRoles={["commission"]}>
              <CommissionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commission/demandes"
          element={
            <ProtectedRoute allowedRoles={["commission"]}>
              <CommissionDemandesManagement />
            </ProtectedRoute>
          }
        />

        {/* Formateur Routes */}
        <Route
          path="/formateur"
          element={
            <ProtectedRoute allowedRoles={["formateur"]}>
              <FormateurDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formateur/demandes"
          element={
            <ProtectedRoute allowedRoles={["formateur"]}>
              <FormateurDemandesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formateur/demandes/create"
          element={
            <ProtectedRoute allowedRoles={["formateur"]}>
              <CreateDemande />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
