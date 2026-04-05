/**
 * AUTH CONTEXT
 * Ajout : refreshUser() pour mettre à jour le solde de tokens depuis le backend
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { AuthUser, LoginCredentials, RegisterData } from '../api/types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>; // ← NOUVEAU
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'auth_user',
    EXPIRES_AT: 'auth_expires_at'
  };

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

  const clearAuthData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur suppression auth:', error);
    }
  };

  const isTokenExpired = (): boolean => {
    try {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      if (!expiresAt) return true;
      return new Date(expiresAt) < new Date();
    } catch {
      return true;
    }
  };

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
    } finally {
      clearAuthData();
    }
  };

  /**
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
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

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
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, token, isLoading,
      login, register, logout, checkAuth, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};