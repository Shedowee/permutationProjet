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
const NotificationDetail = lazy(() => import("./features/admin/pages/NotificationDetail"));
const Logout = lazy(() => import("./auth/pages/Logout"));

const CommissionDashboard = lazy(() => import("./features/commission/pages/CommissionDashboard"));
const CommissionDemandesManagement = lazy(() => import("./features/commission/pages/DemandesManagement"));

const FormateurDashboard = lazy(() => import("./features/formateur/pages/FormateurDashboard"));
const FormateurDemandesManagement = lazy(() => import("./features/formateur/pages/DemandesManagement"));
const CreateDemande = lazy(() => import("./features/formateur/pages/CreateDemande"));
const Profile = lazy(() => import("./shared/pages/Profile"));
const VerifyEmail = lazy(() => import("./shared/pages/VerifyEmail"));

const App = () => {
  // Auth is managed by AuthContext, not Redux
  // Loading state is handled by ProtectedRoute
  const { loading, role, isAuthenticated } = useAuth();

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
              <ProtectedRoute allowedRoles={["admin", "commission", "formateur", "employe"]}>
                {role === "admin" ? (
                  <AdminDashboard />
                ) : role === "commission" ? (
                  <CommissionDashboard />
                ) : (
                  <FormateurDashboard />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/demandes"
            element={
              <ProtectedRoute allowedRoles={["commission", "formateur", "employe"]}>
                {role === "commission" ? (
                  <CommissionDemandesManagement />
                ) : (
                  <FormateurDemandesManagement />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/demandes/create"
            element={
              <ProtectedRoute allowedRoles={["formateur", "employe"]}>
                <CreateDemande />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AssignRoles /></ProtectedRoute>} />
          <Route path="/admin/etablissements" element={<ProtectedRoute allowedRoles={["admin"]}><EtablissementManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
          <Route path="/admin/notifications/:id" element={<ProtectedRoute allowedRoles={["admin"]}><NotificationDetail /></ProtectedRoute>} />

          <Route
            path="/commission"
            element={
              <ProtectedRoute allowedRoles={["commission"]}>
                <CommissionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commission/dashboard"
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
            path="/traitement/demandes"
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
            path="/formateur/dashboard"
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
            path="/mes-demandes"
            element={
              <ProtectedRoute allowedRoles={["formateur", "employe"]}>
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

          <Route
            path="/employe"
            element={
              <ProtectedRoute allowedRoles={["employe"]}>
                <FormateurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/dashboard"
            element={
              <ProtectedRoute allowedRoles={["employe"]}>
                <FormateurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/demandes"
            element={
              <ProtectedRoute allowedRoles={["employe"]}>
                <FormateurDemandesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/demandes/create"
            element={
              <ProtectedRoute allowedRoles={["employe"]}>
                <CreateDemande />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Landing />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "commission", "formateur", "employe"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
