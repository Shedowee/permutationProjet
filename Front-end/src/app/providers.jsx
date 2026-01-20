/**
 * src/app/providers.jsx
 *
 * Central providers for the application
 *
 * Wraps app with:
 * - Redux Provider (for non-auth state management)
 * - AuthProvider (for Sanctum auth context)
 */

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { AuthProvider } from "../auth/context/AuthContext";
import { ToastProvider } from "../shared/context/ToastContext";
import store from "./store";

/**
 * AppProviders component
 *
 * Wraps application with required providers in correct order:
 * 1. Redux Provider (for state management)
 * 2. AuthProvider (for authentication context)
 */
const AppProviders = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
