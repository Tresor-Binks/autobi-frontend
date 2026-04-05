/**
 * AUTH CONTEXT
<<<<<<< HEAD
 * Ajout : refreshUser() pour mettre à jour le solde de tokens depuis le backend
=======
 * 
 * Context React pour gérer l'état d'authentification global de l'application.
 * 
 * FONCTIONNALITÉS :
 * - Gestion de l'utilisateur connecté
 * - Stockage du token
 * - Fonctions login/register/logout
 * - Persistance dans localStorage
 * - Compatible web et desktop (WebView)
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { AuthUser, LoginCredentials, RegisterData } from '../api/types';

<<<<<<< HEAD
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
<<<<<<< HEAD
=======
  // État
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
<<<<<<< HEAD
=======

  // Actions
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
<<<<<<< HEAD
  refreshUser: () => Promise<void>; // ← NOUVEAU
}

=======
}

// ============================================================================
// CONTEXT
// ============================================================================

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

<<<<<<< HEAD
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
=======
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

<<<<<<< HEAD
=======
  /**
   * Clés de stockage
   * Compatible web (localStorage) et desktop (WebView)
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'auth_user',
    EXPIRES_AT: 'auth_expires_at'
  };

<<<<<<< HEAD
  const saveAuthData = (authUser: AuthUser, authToken: string, expiresAt: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt);
      setToken(authToken);
      setUser(authUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur sauvegarde auth:', error);
    }
  };

=======
  /**
 * Sauvegarde des données d'authentification
 */
const saveAuthData = (authUser: AuthUser, authToken: string, expiresAt: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt);

    setToken(authToken);
    setUser(authUser);
    setIsAuthenticated(true);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données d\'authentification:', error);
  }
};

/**
 * CONNEXION
 */
const login = async (credentials: LoginCredentials): Promise<void> => {
  try {
    const response = await authApi.login(credentials);
    // ← CHANGÉ : response.expires_at au lieu de response.expiresAt
    saveAuthData(response.user, response.token, response.expires_at);
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};

/**
 * INSCRIPTION
 */
const register = async (data: RegisterData): Promise<void> => {
  try {
    const response = await authApi.register(data);
    // ← CHANGÉ : response.expires_at au lieu de response.expiresAt
    saveAuthData(response.user, response.token, response.expires_at);
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    throw error;
  }
};

  /**
   * Suppression des données d'authentification
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const clearAuthData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
<<<<<<< HEAD
=======

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
<<<<<<< HEAD
      console.error('Erreur suppression auth:', error);
    }
  };

=======
      console.error('Erreur lors de la suppression des données d\'authentification:', error);
    }
  };

  /**
   * Vérification de l'expiration du token
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const isTokenExpired = (): boolean => {
    try {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      if (!expiresAt) return true;
<<<<<<< HEAD
=======

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      return new Date(expiresAt) < new Date();
    } catch {
      return true;
    }
  };

<<<<<<< HEAD
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authApi.login(credentials);
      saveAuthData(response.user, response.token, response.expires_at);
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await authApi.register(data);
      saveAuthData(response.user, response.token, response.expires_at);
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) await authApi.logout(token);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
=======
  /**
   * DÉCONNEXION
   */
  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    } finally {
      clearAuthData();
    }
  };

  /**
<<<<<<< HEAD
   * NOUVEAU : Rafraîchit le profil utilisateur depuis le backend.
   * Met à jour token_balance et autres données en temps réel.
   */
  const refreshUser = async (): Promise<void> => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!savedToken) return;

    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      });

      if (!response.ok) return;

      const data = await response.json();

      // Conversion snake_case → camelCase
      const updatedUser: AuthUser = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        plan_type: data.plan_type,
        token_balance: data.token_balance,
        created_at: data.created_at,
        last_login: data.last_login,
      };

      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erreur refresh user:', error);
    }
  };

  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);
=======
   * VÉRIFICATION DE L'AUTHENTIFICATION
   * Appelée au montage du composant et après chaque changement
   */
  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

<<<<<<< HEAD
      if (!savedToken || !savedUser) { clearAuthData(); return; }
      if (isTokenExpired()) { clearAuthData(); return; }

      const isValid = await authApi.verifyToken(savedToken);
      if (!isValid) { clearAuthData(); return; }

      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);

      // Rafraîchit immédiatement les données depuis le backend
      await refreshUser();
    } catch (error) {
      console.error('Erreur vérification auth:', error);
=======
      if (!savedToken || !savedUser) {
        clearAuthData();
        return;
      }

      // Vérification de l'expiration
      if (isTokenExpired()) {
        clearAuthData();
        return;
      }

      // Vérification de la validité du token auprès du backend
      const isValid = await authApi.verifyToken(savedToken);

      if (!isValid) {
        clearAuthData();
        return;
      }

      // Restauration de l'état
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
=======
  /**
   * Vérification au montage
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  useEffect(() => {
    checkAuth();
  }, []);

<<<<<<< HEAD
  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, token, isLoading,
      login, register, logout, checkAuth, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
=======
  /**
   * Valeur du context
   */
  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
};