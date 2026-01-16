// src/app/providers.jsx
// Fichier central des providers de l'application
// Centralise tous les context providers et configurations globales

import React from 'react';
import { Provider } from 'react-redux';
import store from './store';

/**
 * Providers de l'application
 * 
 * Ce composant encapsule l'application avec tous les providers nécessaires :
 * - Redux Provider : Gestion de l'état global de l'application
 * - Future extensions : Auth context, Theme provider, etc.
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants à wrapper
 * @returns {JSX.Element} Application wrappée avec tous les providers
 */
const AppProviders = ({ children }) => {
  return (
    // Provider Redux pour la gestion de l'état global
    <Provider store={store}>
      {children}
    </Provider>
  );
};

export default AppProviders;