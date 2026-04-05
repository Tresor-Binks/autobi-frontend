/**
 * TYPES POUR L'API
 * Définit tous les types utilisés pour la communication avec le backend
 */

// Statut d'une analyse
export type AnalysisState = 'pending' | 'running' | 'done' | 'error';

// Réponse lors de l'upload
export interface UploadResponse {
  analysis_id: string;
  status: string;
}

// Statut de progression
export interface AnalysisStatus {
  progress: number;
  step: string;
  state: AnalysisState;
}

// Colonne du schéma
export interface SchemaColumn {
  name: string;
  type: string;
  sample: any[];
}

// Statistiques d'une colonne
export interface ColumnStats {
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  count?: number;
}

// Graphique
export interface ChartData {
  type: string;
  title: string;
  data: any[];
}

// Résultat complet de l'analyse
export interface AnalysisResult {
  schema: {
    columns: SchemaColumn[];
  };
  stats: {
    [key: string]: ColumnStats;
  };
  charts: ChartData[];
  insights: string[];
}

// Historique d'analyse
export interface AnalysisHistory {
  id: string;
  filename: string;
  uploadDate: string;
  status: string;
}

// ✅ Réponse de l'IA (AJOUT DU TYPE MANQUANT)
export interface AIResponse {
  answer: string;
}


// ============================================================================
// TYPES POUR L'AUTHENTIFICATION
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;  // ← Type number pour correspondre au backend
  firstName: string;
  lastName: string;
  email: string;
  plan_type: 'pay_as_you_go' | 'monthly_unlimited';
  token_balance: number;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  expires_at: string;
}

export interface FileValidationResponse {
  valid: boolean;
  fileName: string;
  fileSize: number;
  sheetCount: number;
  errors?: string[];
  warnings?: string[];  // ← ajouter
}