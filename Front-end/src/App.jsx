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
import { lazy, Suspense } from "react";
import { useAuth } from "./auth/hooks/useAuth";

import ProtectedRoute from "./routes/ProtectedRoute";

const Login = lazy(() => import("./auth/pages/Login"));

const AdminDashboard = lazy(() => import("./features/admin/pages/AdminDashboard"));
const UserManagement = lazy(() => import("./features/admin/pages/UserManagement"));
const AssignRoles = lazy(() => import("./features/admin/pages/AssignRoles"));
const ViewLogs = lazy(() => import("./features/admin/pages/ViewLogs"));
const EtablissementManagement = lazy(() => import("./features/admin/pages/EtablissementManagement"));
const Settings = lazy(() => import("./features/admin/pages/Settings"));

const CommissionDashboard = lazy(() => import("./features/commission/pages/CommissionDashboard"));
const CommissionDemandesManagement = lazy(() => import("./features/commission/pages/DemandesManagement"));

const FormateurDashboard = lazy(() => import("./features/formateur/pages/FormateurDashboard"));
const FormateurDemandesManagement = lazy(() => import("./features/formateur/pages/DemandesManagement"));
const CreateDemande = lazy(() => import("./features/formateur/pages/CreateDemande"));

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
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />

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
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />

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

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
