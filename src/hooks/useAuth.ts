/**
 * HOOK useAuth
 * 
 * Hook personnalisé pour accéder facilement au context d'authentification.
 * 
 * USAGE :
 * const { isAuthenticated, user, login, logout } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }

  return context;
};