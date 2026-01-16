// src/services/authService.js
// Service d'authentification pour communiquer avec Laravel Sanctum
// Ne contient QUE de la logique API - pas de JSX
import api from './api';

/**
 * Service d'authentification sécurisée avec Laravel Sanctum
 * Utilise des cookies HttpOnly - aucun token stocké côté frontend
 */

/**
 * Fonction de connexion
 * @param {Object} credentials - Identifiants de connexion { email, password }
 * @returns {Promise<Object>} - Réponse de l'API contenant les informations utilisateur
 * 
 * Processus :
 * 1. Envoie les identifiants au backend
 * 2. Laravel Sanctum crée une session et définit un cookie HttpOnly
 * 3. Le cookie est géré automatiquement par le navigateur
 */
export const login = async (credentials) => {
  try {
    console.log('🔐 Tentative de connexion avec:', credentials.email);
    
    // Appel POST vers /api/login
    // Laravel Sanctum gère automatiquement le cookie de session HttpOnly
    const response = await api.post('/api/login', credentials);
    
    console.log('✅ Connexion réussie - cookie session créé');
    return response.data;
  } catch (error) {
    // Reformater l'erreur pour le frontend
    const errorMessage = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Erreur de connexion au serveur';
    
    console.error('❌ Erreur de connexion:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fonction de déconnexion
 * @returns {Promise<void>}
 * 
 * Processus :
 * 1. Invalide la session côté backend
 * 2. Le cookie est supprimé automatiquement par Laravel
 */
export const logout = async () => {
  try {
    console.log('🚪 Déconnexion en cours...');
    
    // Appel POST vers /api/logout
    // Invalide la session Sanctum côté backend
    await api.post('/api/logout');
    
    console.log('✅ Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    // Même en cas d'erreur, on considère l'utilisateur déconnecté côté frontend
    // Le cookie sera supprimé par le navigateur
  }
};

/**
 * Fonction pour récupérer l'utilisateur connecté
 * @returns {Promise<Object>} - Informations de l'utilisateur actuellement connecté
 * 
 * Processus :
 * 1. Le cookie de session est envoyé automatiquement grâce à withCredentials
 * 2. Laravel vérifie la session et retourne les infos utilisateur
 */
export const getCurrentUser = async () => {
  try {
    console.log('👤 Récupération des informations utilisateur...');
    
    // Appel GET vers /api/me
    // Le cookie est envoyé automatiquement grâce à withCredentials: true
    const response = await api.get('/api/me');
    
    console.log('✅ Utilisateur récupéré:', response.data.user?.email);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        'Impossible de récupérer les informations utilisateur';
    
    console.error('❌ Erreur récupération utilisateur:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Fonction pour vérifier l'état d'authentification
 * @returns {Promise<boolean>} - True si l'utilisateur est authentifié
 * 
 * Utile pour vérifier l'état au démarrage de l'application
 */
export const checkAuthStatus = async () => {
  try {
    await getCurrentUser();
    return true;
  } catch (_error) {
    // Si erreur 401, l'utilisateur n'est plus authentifié
    return false;
  }
};