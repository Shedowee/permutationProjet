// src/routes/ProtectedRoute.jsx
// Composant de protection des routes par rôle
// Vérifie l'authentification et les permissions avant d'accéder aux routes

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
// Sélecteurs pour l'état d'authentification
import { selectIsAuthenticated, selectUserRole } from '../auth/redux/authSlice';

/**
 * Composant de route protégée
 * 
 * Vérifie :
 * 1. Si l'utilisateur est authentifié
 * 2. Si l'utilisateur a le bon rôle pour accéder à la route
 * 3. Redirige automatiquement selon le rôle si accès non autorisé
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composant à protéger
 * @param {string[]} props.allowedRoles - Rôles autorisés à accéder à cette route
 * @returns {JSX.Element} Composant protégé ou redirection
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // === RÉCUPÉRATION DE L'ÉTAT D'AUTHENTIFICATION ===
  // Depuis Redux store
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  
  // Pour la redirection après login
  const location = useLocation();

  // === VÉRIFICATION D'AUTHENTIFICATION ===
  // Si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    // Rediriger vers la page de login
    // Conserver l'URL demandée pour redirection après login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // === VÉRIFICATION DES PERMISSIONS ===
  // Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirection vers le dashboard approprié selon le rôle de l'utilisateur
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'commission':
        return <Navigate to="/commission" replace />;
      case 'formateur':
        return <Navigate to="/formateur" replace />;
      default:
        // Si aucun rôle valide, redirection vers login
        return <Navigate to="/login" replace />;
    }
  }

  // === ACCÈS AUTORISÉ ===
  // Si toutes les vérifications passent, afficher le composant protégé
  return children;
};

export default ProtectedRoute;