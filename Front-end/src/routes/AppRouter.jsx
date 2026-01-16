// src/routes/AppRouter.jsx
// Routeur principal de l'application avec gestion des rôles
// Centralise toutes les routes et leur protection par rôle

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages publiques
import Login from '../auth/pages/Login';

// Pages Admin
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import UserManagement from '../features/admin/pages/UserManagement';
import AssignRoles from '../features/admin/pages/AssignRoles';
import ViewLogs from '../features/admin/pages/ViewLogs';
import EtablissementManagement from '../features/admin/pages/EtablissementManagement';

// Pages Commission
import CommissionDashboard from '../features/commission/pages/CommissionDashboard';
import CommissionDemandesManagement from '../features/commission/pages/DemandesManagement';

// Pages Formateur
import FormateurDashboard from '../features/formateur/pages/FormateurDashboard';
import FormateurDemandesManagement from '../features/formateur/pages/DemandesManagement';
import CreateDemande from '../features/formateur/pages/CreateDemande';

/**
 * Routeur principal de l'application
 * 
 * Gère :
 * - Les routes publiques (login)
 * - Les routes protégées par rôle
 * - La redirection automatique selon le rôle
 * - La structure hiérarchique des routes
 * 
 * Structure des routes :
 * /login - Page d'authentification
 * /admin/* - Routes admin protégées
 * /commission/* - Routes commission protégées  
 * /formateur/* - Routes formateur protégées
 */
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Route publique de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes Admin protégées */}
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
        
        {/* Routes Commission protégées */}
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
        
        {/* Routes Formateur protégées */}
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
        
        {/* Redirection par défaut vers login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;