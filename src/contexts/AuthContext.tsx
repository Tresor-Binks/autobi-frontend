/**
 * AUTH CONTEXT
 * 
 * Context React pour gérer l'état d'authentification global de l'application.
 * 
 * FONCTIONNALITÉS :
 * - Gestion de l'utilisateur connecté
 * - Stockage du token
 * - Fonctions login/register/logout
 * - Persistance dans localStorage
 * - Compatible web et desktop (WebView)
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { AuthUser, LoginCredentials, RegisterData } from '../api/types';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  // État
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Clés de stockage
   * Compatible web (localStorage) et desktop (WebView)
   */
  const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'auth_user',
    EXPIRES_AT: 'auth_expires_at'
  };

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
  const clearAuthData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);

      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la suppression des données d\'authentification:', error);
    }
  };

  /**
   * Vérification de l'expiration du token
   */
  const isTokenExpired = (): boolean => {
    try {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      if (!expiresAt) return true;

      return new Date(expiresAt) < new Date();
    } catch {
      return true;
    }
  };

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
    } finally {
      clearAuthData();
    }
  };

  /**
   * VÉRIFICATION DE L'AUTHENTIFICATION
   * Appelée au montage du composant et après chaque changement
   */
  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

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
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vérification au montage
   */
  useEffect(() => {
    checkAuth();
  }, []);

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
};