/**
 * CONFIGURATION AXIOS
 * 
 * Configure Axios pour le backend FastAPI
 */

import axios from 'axios';

// URL de base du backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configuration par défaut
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

/**
 * Intercepteur de requêtes
 * Ajoute automatiquement le token dans les headers
 */
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponses
 * Gère les erreurs d'authentification (401)
 */
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Erreur 401 : Token invalide ou expiré
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expires_at');

      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default axios;