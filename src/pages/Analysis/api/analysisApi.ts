/**
 * ANALYSIS API SERVICE
 * Connecté au backend FastAPI Python.
 *
 * WORKFLOW :
 * 1. validateFile  → POST /analysis/validate
 * 2. preAnalyzeFile → POST /analysis/upload  ← appelle GPT-4o-mini côté backend,
 *                     retourne metadata + suggested_insights (déjà prêts)
 * 3. suggestInsights → lit this.cachedInsights (stockés par preAnalyzeFile), ZÉRO appel réseau
 * 4. runAnalysis   → POST /analysis/{id}/confirm  (envoie les IDs sélectionnés)
 * 5. getAnalysisProgress → GET /analysis/{id}  (poll jusqu'à COMPLETED)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FileValidationResponse {
  valid: boolean;
  fileName: string;
  fileSize: number;
  sheetCount: number;
  errors?: string[];
  warnings?: string[];
}

export interface Column {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  nullCount: number;
}

export interface PreAnalysisResponse {
  columns: Column[];
  rowCount: number;
  hasHeaders: boolean;
  dataQuality: 'good' | 'fair' | 'poor';
  warnings?: string[];
  dataset_id?: string;
  metadata?: any;
  // Insights déjà générés par GPT-4o-mini — prêts pour l'étape 3
  suggestedInsights: SuggestedInsight[];
  aiSummary: string;
}

export interface SuggestedInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'comparison' | 'total' | 'anomaly' | 'distribution';
  feasibility: 'high' | 'medium' | 'low';
  requiredColumns: string[];
}

export interface InsightValidationResponse {
  valid: boolean;
  reason?: string;
}

export interface CustomInsightValidationResponse {
  valid: boolean;
  reformulated_title?: string;
  reformulated_description?: string;
  required_columns?: string[];
  type?: SuggestedInsight['type'];
  feasibility?: SuggestedInsight['feasibility'];
  reason?: string;
  error?: string;
}

export interface AnalysisRunResponse {
  analysisId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisProgressResponse {
  progress: number;
  currentStep: string;
  status: 'processing' | 'completed' | 'failed';
}

// ============================================================================
// HELPERS
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Erreur ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// CONVERSIONS Backend → Frontend
// ============================================================================

function convertMetadataToColumns(metadata: any): Column[] {
  if (!metadata) return [];
  const columns: Column[] = [];
  const allColumns: string[] = metadata.columns || [];
  const columnTypes: Record<string, any> = metadata.column_types || {};
  const statistics: Record<string, any> = metadata.statistics || {};

  for (const colName of allColumns) {
    const colInfo = columnTypes[colName] || {};
    const semanticType = colInfo.semantic_type || 'text';
    const stat = statistics[colName] || {};

    let frontendType: Column['type'] = 'text';
    if (colInfo.is_numeric) frontendType = 'number';
    else if (colInfo.is_date) frontendType = 'date';
    else if (semanticType === 'boolean') frontendType = 'boolean';

    let sampleValues: any[] = [];
    if (colInfo.is_numeric) {
      sampleValues = [stat.min, stat.mean, stat.max].filter(v => v !== null && v !== undefined);
    } else if (stat.top_values) {
      sampleValues = stat.top_values.slice(0, 3).map((v: any) => v.value);
    }

    columns.push({ name: colName, type: frontendType, sampleValues, nullCount: stat.null_count ?? 0 });
  }
  return columns;
}

function computeDataQuality(metadata: any): 'good' | 'fair' | 'poor' {
  if (!metadata) return 'fair';
  const total = metadata.row_count * metadata.column_count;
  if (total === 0) return 'fair';
  const pct = (metadata.missing_values || 0) / total;
  if (pct < 0.05) return 'good';
  if (pct < 0.2) return 'fair';
  return 'poor';
}

/**
 * Convertit les suggested_insights du backend (snake_case) vers le format frontend.
 */
function convertSuggestedInsights(rawInsights: any[]): SuggestedInsight[] {
  if (!rawInsights || !Array.isArray(rawInsights)) return [];

  return rawInsights.slice(0, 6).map((insight, idx) => ({
    id: insight.id || `insight_${idx + 1}`,
    title: insight.title || `Insight ${idx + 1}`,
    description: insight.description || '',
    type: insight.type || 'comparison',
    feasibility: insight.feasibility || 'medium',
    requiredColumns: insight.required_columns || [],
  }));
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class AnalysisApiService {
  private currentDatasetId: string | null = null;
  private currentMetadata: any = null;
  private currentAnalysisId: number | null = null;

  // Insights générés par GPT-4o-mini pendant l'upload — lus directement à l'étape 3
  private cachedInsights: SuggestedInsight[] = [];
  private cachedAiSummary: string = '';

  // -----------------------------------------------------------------------
  // ÉTAPE 1 : Validation du fichier — POST /analysis/validate
  // -----------------------------------------------------------------------
  async validateFile(file: File): Promise<FileValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${BASE_URL}/analysis/validate`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return {
      valid: data.valid,
      fileName: data.file_name,
      fileSize: data.file_size,
      sheetCount: data.sheet_count,
      errors: data.errors?.length > 0 ? data.errors : undefined,
      warnings: data.warnings?.length > 0 ? data.warnings : undefined,
    };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 2 : Upload + GPT-4o-mini — POST /analysis/upload
  //
  // Le backend :
  //   1. Lit le fichier Excel
  //   2. Appelle GPT-4o-mini (max 3 min)
  //   3. Retourne metadata + suggested_insights + ai_summary
  //
  // On stocke les insights dans this.cachedInsights.
  // L'étape 3 les lit directement — ZÉRO polling.
  // -----------------------------------------------------------------------
  async preAnalyzeFile(file: File): Promise<PreAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${BASE_URL}/analysis/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Erreur ${response.status}`);
    }

    const data = await response.json();

    this.currentDatasetId = data.dataset_id;
    this.currentMetadata = data.metadata;
    this.currentAnalysisId = data.analysis_id;

    // Stockage des insights générés par l'IA — disponibles immédiatement
    this.cachedInsights = convertSuggestedInsights(data.suggested_insights || []);
    this.cachedAiSummary = data.ai_summary || '';

    console.log(`✅ Upload OK — analysis_id: ${data.analysis_id}, ${this.cachedInsights.length} insights GPT-4o-mini prêts`);

    const columns = convertMetadataToColumns(data.metadata);
    const dataQuality = computeDataQuality(data.metadata);
    const warnings: string[] = [];
    if (data.metadata?.missing_values > 0) {
      warnings.push(`${data.metadata.missing_values} valeurs manquantes détectées`);
    }

    return {
      columns,
      rowCount: data.metadata?.row_count || 0,
      hasHeaders: true,
      dataQuality,
      warnings,
      dataset_id: data.dataset_id,
      metadata: data.metadata,
      suggestedInsights: this.cachedInsights,
      aiSummary: this.cachedAiSummary,
    };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 3 : Insights — lecture directe du cache, ZÉRO appel réseau
  //
  // Les insights ont été générés pendant l'upload (étape 2).
  // Cette fonction est synchrone en pratique — elle retourne le cache immédiatement.
  // -----------------------------------------------------------------------
  async suggestInsights(_columns: Column[]): Promise<SuggestedInsight[]> {
    if (this.cachedInsights.length > 0) {
      console.log(`📋 ${this.cachedInsights.length} insights depuis le cache GPT-4o-mini`);
      return this.cachedInsights;
    }

    // Ne devrait jamais arriver en temps normal (upload toujours avant)
    console.warn('⚠️ Cache vide — suggestInsights appelé avant preAnalyzeFile ?');
    return [];
  }

  // Expose le résumé IA pour l'affichage
  getAiSummary(): string {
    return this.cachedAiSummary;
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 3bis : Validation d'un insight personnalisé — POST /analysis/validate-insight
  // -----------------------------------------------------------------------
  async validateCustomInsight(description: string): Promise<CustomInsightValidationResponse> {
    const body: any = { description };
    if (this.currentAnalysisId) {
      body.analysis_id = this.currentAnalysisId;
    }

    return apiFetch('/analysis/validate-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 4 : Validation locale simple (garde-fou UI)
  // -----------------------------------------------------------------------
  async validateInsight(description: string, _columns: Column[]): Promise<InsightValidationResponse> {
    if (description.trim().length < 10) {
      return { valid: false, reason: 'Description trop courte. Soyez plus précis.' };
    }
    return { valid: true };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 5 : Confirmation — POST /analysis/{id}/confirm
  //
  // Envoie les IDs des insights sélectionnés par l'utilisateur.
  // Le backend déduit les tokens et lance le pipeline graphiques.
  // -----------------------------------------------------------------------
  async runAnalysis(_file: File, selectedInsights: SuggestedInsight[]): Promise<AnalysisRunResponse> {
    if (!this.currentAnalysisId) {
      throw new Error('Aucune analyse en attente. Veuillez recommencer depuis le début.');
    }

    const selectedIds = selectedInsights.map(i => i.id);

    const result = await apiFetch<any>(`/analysis/${this.currentAnalysisId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_insights: selectedIds }),
    });

    console.log(`🚀 Analyse #${result.analysis_id} lancée — ${result.selected_insights_count} insight(s)`);

    return {
      analysisId: String(result.analysis_id),
      status: 'processing',
    };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 6 : Suivi de progression — GET /analysis/{id}
  // Poll jusqu'à COMPLETED ou FAILED.
  // -----------------------------------------------------------------------
  async getAnalysisProgress(analysisId: string): Promise<AnalysisProgressResponse> {
    const data = await apiFetch<any>(`/analysis/${analysisId}`);
    const normalizedStatus = data.status?.toLowerCase();

    const steps = [
      'Chargement des données...',
      'Analyse de la structure...',
      'Génération des insights...',
      'Création des graphiques...',
      'Finalisation du dashboard...',
    ];

    let progress = 20;
    let currentStep = steps[0];

    if (normalizedStatus === 'processing') {
      progress = 55; currentStep = steps[2];
    } else if (normalizedStatus === 'completed') {
      progress = 100; currentStep = steps[4];
    } else if (normalizedStatus === 'failed') {
      progress = 0; currentStep = "Erreur lors de l'analyse";
    }

    return {
      progress,
      currentStep,
      status: normalizedStatus === 'completed' ? 'completed'
            : normalizedStatus === 'failed' ? 'failed'
            : 'processing',
    };
  }

  // -----------------------------------------------------------------------
  // RESET — à appeler si on repart de zéro
  // -----------------------------------------------------------------------
  reset() {
    this.currentDatasetId = null;
    this.currentMetadata = null;
    this.currentAnalysisId = null;
    this.cachedInsights = [];
    this.cachedAiSummary = '';
  }
}

export const analysisApi = new AnalysisApiService();