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
import GuestRoute from "./routes/GuestRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./auth/pages/Login"));
const Signup = lazy(() => import("./auth/pages/Signup"));
const ForgotPassword = lazy(() => import("./auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./auth/pages/ResetPassword"));

const AdminDashboard = lazy(() => import("./features/admin/pages/AdminDashboard"));
const UserManagement = lazy(() => import("./features/admin/pages/UserManagement"));
const AssignRoles = lazy(() => import("./features/admin/pages/AssignRoles"));
const EtablissementManagement = lazy(() => import("./features/admin/pages/EtablissementManagement"));
const Settings = lazy(() => import("./features/admin/pages/Settings"));
const ViewLogs = lazy(() => import("./features/admin/pages/ViewLogs"));
const NotificationHistory = lazy(() => import("./features/admin/pages/NotificationHistory"));
const NotificationDetail = lazy(() => import("./features/admin/pages/NotificationDetail"));
const LogDetail = lazy(() => import("./features/admin/pages/LogDetail"));
const Logout = lazy(() => import("./auth/pages/Logout"));

const CommissionDashboard = lazy(() => import("./features/commission/pages/CommissionDashboard"));
const CommissionDemandesManagement = lazy(() => import("./features/commission/pages/DemandesManagement"));

const FormateurDashboard = lazy(() => import("./features/formateur/pages/FormateurDashboard"));
const FormateurDemandesManagement = lazy(() => import("./features/formateur/pages/DemandesManagement"));
const FormateurValidatedDemandes = lazy(() => import("./features/formateur/pages/ValidatedDemandes"));
const CreateDemande = lazy(() => import("./features/formateur/pages/CreateDemande"));
const Profile = lazy(() => import("./shared/pages/Profile"));
const VerifyEmail = lazy(() => import("./shared/pages/VerifyEmail"));
const NotFoundResource = lazy(() => import("./shared/pages/NotFoundResource"));

const App = () => {
  // Auth is managed by AuthContext, not Redux
  // Loading state is handled by ProtectedRoute
  const { loading, role } = useAuth();

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
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "commission", "formateur", "user", null]}>
                {role === "admin" ? (
                  <AdminDashboard />
                ) : role === "commission" ? (
                  <CommissionDashboard />
                ) : role === "user" ? (
                  <Profile />
                ) : role === null ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <FormateurDashboard />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/demandes"
            element={
              <ProtectedRoute allowedRoles={["formateur"]}>
                <FormateurDemandesManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin specific routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AssignRoles /></ProtectedRoute>} />
          <Route path="/admin/etablissements" element={<ProtectedRoute allowedRoles={["admin"]}><EtablissementManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={["admin"]}><ViewLogs /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><NotificationHistory /></ProtectedRoute>} />
          <Route path="/admin/notifications/:id" element={<ProtectedRoute allowedRoles={["admin"]}><NotificationDetail /></ProtectedRoute>} />
          <Route path="/admin/logs/:id" element={<ProtectedRoute allowedRoles={["admin"]}><LogDetail /></ProtectedRoute>} />

          {/* Commission specific routes */}
          <Route path="/commission" element={<ProtectedRoute allowedRoles={["commission"]}><CommissionDashboard /></ProtectedRoute>} />
          <Route path="/commission/demandes" element={<ProtectedRoute allowedRoles={["commission"]}><CommissionDemandesManagement /></ProtectedRoute>} />

          {/* Formateur specific routes */}
          <Route path="/formateur" element={<ProtectedRoute allowedRoles={["formateur"]}><FormateurDashboard /></ProtectedRoute>} />
          <Route path="/formateur/demandes" element={<ProtectedRoute allowedRoles={["formateur"]}><FormateurDemandesManagement /></ProtectedRoute>} />
          <Route path="/formateur/permutations-validees" element={<ProtectedRoute allowedRoles={["formateur"]}><FormateurValidatedDemandes /></ProtectedRoute>} />
          <Route path="/formateur/demandes/create" element={<ProtectedRoute allowedRoles={["formateur"]}><CreateDemande /></ProtectedRoute>} />
          <Route path="/mes-demandes" element={<ProtectedRoute allowedRoles={["formateur"]}><FormateurDemandesManagement /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute allowedRoles={["admin", "commission", "formateur", "user", null]}><Profile /></ProtectedRoute>} />
          <Route path="/not-found" element={<NotFoundResource />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
