/**
 * API D'AUTHENTIFICATION
 * 
 * VERSION PRODUCTION - Connectée au backend FastAPI
 */

import axios from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, AuthUser } from './types';

// URL du backend (à configurer selon l'environnement)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'autobi-backend-production.up.railway.app';

class AuthApiService {
  private baseURL = `${API_BASE_URL}/auth`;

  /**
   * CONNEXION
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${this.baseURL}/login`, {
      email: credentials.email,
      password: credentials.password
    });

    const data = response.data;

    // Conversion snake_case → camelCase
    return {
      token: data.token,
      expires_at: data.expires_at,
      user: {
        id: data.user.id,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        email: data.user.email,
        plan_type: data.user.plan_type,
        token_balance: data.user.token_balance,
        created_at: data.user.created_at,
        last_login: data.user.last_login,
      }
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erreur lors de la connexion');
  }
}

  /**
   * INSCRIPTION
   * POST /auth/register
   */
  async register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${this.baseURL}/register`, {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName
    });

    const res = response.data;

    // Conversion snake_case → camelCase
    return {
      token: res.token,
      expires_at: res.expires_at,
      user: {
        id: res.user.id,
        firstName: res.user.first_name,
        lastName: res.user.last_name,
        email: res.user.email,
        plan_type: res.user.plan_type,
        token_balance: res.user.token_balance,
        created_at: res.user.created_at,
        last_login: res.user.last_login,
      }
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erreur lors de l\'inscription');
  }
}

  /**
   * RÉCUPÉRATION DE L'UTILISATEUR ACTUEL
   * GET /auth/me
   */
  async getCurrentUser(token: string): Promise<AuthUser> {
    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Erreur lors de la récupération du profil');
    }
  }

  /**
   * DÉCONNEXION
   * POST /auth/logout
   */
  async logout(token: string): Promise<void> {
    // Le backend FastAPI n'a pas de route logout spécifique
    // La déconnexion se fait côté client en supprimant le token
    return Promise.resolve();
  }

  /**
   * VÉRIFICATION DE LA VALIDITÉ DU TOKEN
   * GET /auth/verify
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await axios.get(`${this.baseURL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Export de l'instance unique
export const authApi = new AuthApiService();