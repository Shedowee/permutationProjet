// src/App.jsx
// Configuration principale de l'application avec gestion des routes
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
// Composants
import Login from './auth/pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
// Pages existantes
import AdminDashboard from './features/admin/pages/AdminDashboard';
import UserManagement from './features/admin/pages/UserManagement';
import AssignRoles from './features/admin/pages/AssignRoles';
import ViewLogs from './features/admin/pages/ViewLogs';
import EtablissementManagement from './features/admin/pages/EtablissementManagement';
import CommissionDashboard from './features/commission/pages/CommissionDashboard';
import FormateurDashboard from './features/formateur/pages/FormateurDashboard';
import CommissionDemandesManagement from './features/commission/pages/DemandesManagement';
import FormateurDemandesManagement from './features/formateur/pages/DemandesManagement';
import CreateDemande from './features/formateur/pages/CreateDemande';
// Thunk pour vérifier l'état d'authentification
import { checkAuthStatus } from './auth/redux/authSlice';
// Sélecteurs
import { selectIsAuthenticated } from './auth/redux/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // === VÉRIFICATION DE L'AUTHENTIFICATION AU DÉMARRAGE ===
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (cookie valide)
    dispatch(checkAuthStatus());
  }, [dispatch]);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/admin" replace />
        } />
        
        {/* Routes Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/roles" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AssignRoles />
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ViewLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/etablissements" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EtablissementManagement />
          </ProtectedRoute>
        } />
        
        {/* Routes Commission */}
        <Route path="/commission" element={
          <ProtectedRoute allowedRoles={['commission']}>
            <CommissionDashboard />
          </ProtectedRoute>
        } />
        <Route path="/commission/demandes" element={
          <ProtectedRoute allowedRoles={['commission']}>
            <CommissionDemandesManagement />
          </ProtectedRoute>
        } />
        
        {/* Routes Formateur */}
        <Route path="/formateur" element={
          <ProtectedRoute allowedRoles={['formateur']}>
            <FormateurDashboard />
          </ProtectedRoute>
        } />
        <Route path="/formateur/demandes" element={
          <ProtectedRoute allowedRoles={['formateur']}>
            <FormateurDemandesManagement />
          </ProtectedRoute>
        } />
        <Route path="/formateur/demandes/create" element={
          <ProtectedRoute allowedRoles={['formateur']}>
            <CreateDemande />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;