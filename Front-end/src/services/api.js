// src/services/api.js
// Service API centralisé pour communiquer avec le backend Laravel Sanctum
import axios from 'axios';

/**
 * Configuration Axios pour Laravel Sanctum avec gestion des cookies HttpOnly
 * Cette configuration permet :
 * - Communication avec le backend Laravel
 * - Gestion automatique des cookies de session
 * - Gestion des erreurs globales
 */
const api = axios.create({
  // URL du backend Laravel (à configurer selon votre environnement)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // TRÈS IMPORTANT : Active les cookies pour Sanctum
  // Permet d'envoyer/recevoir les cookies HttpOnly automatiquement
  withCredentials: true,
  
  // Headers par défaut pour les requêtes API
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Nécessaire pour Laravel
  }
});

// Interceptor de requête - exécuté avant chaque appel API
api.interceptors.request.use(
  (config) => {
    // Peut être utilisé pour ajouter des headers dynamiques
    // Par exemple, récupérer le CSRF token si nécessaire
    /*
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    */
    
    console.log(`🚀 Appel API vers: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur interceptor requête:', error);
    return Promise.reject(error);
  }
);

// Interceptor de réponse - exécuté après chaque réponse API
api.interceptors.response.use(
  (response) => {
    // Succès - log optionnel pour le développement
    console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Gestion centralisée des erreurs
    console.error('❌ Erreur API:', error.response?.status, error.response?.data);
    
    // Gestion spécifique des erreurs d'authentification
    if (error.response?.status === 401) {
      // 401 Unauthorized - Session expirée ou non authentifié
      console.warn('🔒 Session expirée - déconnexion automatique');
      // Ici, on pourrait dispatcher une action de logout
      // store.dispatch(logout());
    }
    
    if (error.response?.status === 403) {
      // 403 Forbidden - Accès refusé
      console.warn('⛔ Accès non autorisé à cette ressource');
    }
    
    // Pour les erreurs réseau ou serveur
    if (!error.response) {
      console.error('🌐 Erreur réseau - vérifier la connexion au backend');
    }
    
    return Promise.reject(error);
  }
);

export default api;