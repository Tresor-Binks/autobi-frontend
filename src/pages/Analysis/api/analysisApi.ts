/**
 * ANALYSIS API SERVICE
 * Connecté au backend FastAPI Python.
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

function convertAIInstructionsToInsights(aiInstructions: any): SuggestedInsight[] {
  const insights: SuggestedInsight[] = [];

  const rawInsights = aiInstructions?.insights || [];
  for (const insight of rawInsights) {
    if (typeof insight === 'object' && insight.title) {
      insights.push({
        id: insight.id || `insight_${insights.length}`,
        title: insight.title,
        description: insight.description || '',
        type: insight.type || 'comparison',
        feasibility: insight.feasibility || 'medium',
        requiredColumns: insight.required_columns || [],
      });
    } else if (typeof insight === 'string') {
      insights.push({
        id: `insight_${insights.length}`,
        title: insight,
        description: insight,
        type: 'comparison',
        feasibility: 'medium',
        requiredColumns: [],
      });
    }
  }

  if (insights.length < 6) {
    const charts = aiInstructions?.charts || [];
    for (const chart of charts) {
      if (insights.length >= 6) break;
      insights.push({
        id: chart.id || `chart_${insights.length}`,
        title: chart.title || `Graphique ${chart.type}`,
        description: chart.description || `${chart.y || ''} par ${chart.x || ''}`,
        type: chart.type === 'line' ? 'trend' : 'comparison',
        feasibility: 'high',
        requiredColumns: [chart.x, chart.y].filter(Boolean),
      });
    }
  }

  return insights.slice(0, 6);
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class AnalysisApiService {
  private currentDatasetId: string | null = null;
  private currentMetadata: any = null;
  private currentAnalysisId: number | null = null;

  // Indique si les derniers insights viennent vraiment d'OpenAI (pas du fallback)
  public lastInsightsFromAI: boolean = false;

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
  // ÉTAPE 2 : Upload + pré-analyse — POST /analysis/upload
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

    console.log(`✅ Upload OK — analysis_id: ${data.analysis_id}`);

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
    };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 3 : Suggestions d'insights — poll GET /analysis/{id}
  // -----------------------------------------------------------------------
  async suggestInsights(columns: Column[]): Promise<SuggestedInsight[]> {
    if (!this.currentAnalysisId) {
      console.warn('⚠️ Pas d\'analysis_id — fallback immédiat');
      this.lastInsightsFromAI = false;
      return this.getFallbackInsights(columns);
    }

    console.log(`🔄 Polling analyse #${this.currentAnalysisId}...`);

    const maxAttempts = 120;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      try {
        const result = await apiFetch<any>(`/analysis/${this.currentAnalysisId}`);
        const normalizedStatus = result.status?.toLowerCase();
        console.log(`📊 Statut: ${result.status} (${i + 1}s)`);

        if (normalizedStatus === 'completed') {
          const aiInstructions = result.ai_instructions || {};
          const summary: string = aiInstructions.summary || '';

          // Détermine si les insights viennent vraiment d'OpenAI
          // Le fallback inclut toujours "indisponible" ou "Analyse automatique" dans le summary
          const isRealAI = summary.length > 0
            && !summary.includes('indisponible')
            && !summary.includes('Analyse automatique');

          this.lastInsightsFromAI = isRealAI;

          const insights = convertAIInstructionsToInsights(aiInstructions);

          if (insights.length === 0) {
            console.warn('⚠️ Aucun insight — fallback local');
            this.lastInsightsFromAI = false;
            return this.getFallbackInsights(columns);
          }

          console.log(`✅ ${insights.length} insights — IA: ${isRealAI}`);
          return insights;
        }

        if (normalizedStatus === 'failed') {
          console.error('❌ Analyse échouée');
          break;
        }

      } catch (e) {
        console.error('Erreur polling:', e);
      }
    }

    this.lastInsightsFromAI = false;
    return this.getFallbackInsights(columns);
  }

  // -----------------------------------------------------------------------
  // FALLBACK insights locaux
  // -----------------------------------------------------------------------
  private getFallbackInsights(columns: Column[]): SuggestedInsight[] {
    this.lastInsightsFromAI = false;

    const insights: SuggestedInsight[] = [];
    const numericCols = columns.filter(c => c.type === 'number');
    const dateCols = columns.filter(c => c.type === 'date');
    const textCols = columns.filter(c => c.type === 'text');

    if (dateCols.length > 0 && numericCols.length > 0) {
      insights.push({
        id: 'fallback_trend',
        title: `Évolution de ${numericCols[0].name} dans le temps`,
        description: `Tendance de ${numericCols[0].name} sur la période`,
        type: 'trend', feasibility: 'high',
        requiredColumns: [dateCols[0].name, numericCols[0].name],
      });
    }
    if (numericCols.length >= 2) {
      insights.push({
        id: 'fallback_comparison',
        title: `Comparaison ${numericCols[0].name} vs ${numericCols[1].name}`,
        description: 'Comparaison entre les deux principales métriques',
        type: 'comparison', feasibility: 'high',
        requiredColumns: [numericCols[0].name, numericCols[1].name],
      });
    }
    if (textCols.length > 0 && numericCols.length > 0) {
      insights.push({
        id: 'fallback_groupby',
        title: `Total ${numericCols[0].name} par ${textCols[0].name}`,
        description: 'Agrégation par catégorie',
        type: 'total', feasibility: 'high',
        requiredColumns: [textCols[0].name, numericCols[0].name],
      });
    }
    if (numericCols.length > 0) {
      insights.push({
        id: 'fallback_distribution',
        title: `Distribution de ${numericCols[0].name}`,
        description: 'Répartition des valeurs',
        type: 'distribution', feasibility: 'high',
        requiredColumns: [numericCols[0].name],
      });
    }
    return insights;
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
  // ÉTAPE 4 : Validation locale (fallback)
  // -----------------------------------------------------------------------
  async validateInsight(description: string, columns: Column[]): Promise<InsightValidationResponse> {
    if (description.trim().length < 10) {
      return { valid: false, reason: 'Description trop courte. Soyez plus précis.' };
    }
    const columnNames = columns.map(c => c.name.toLowerCase());
    const mentionsColumn = columnNames.some(col => description.toLowerCase().includes(col));
    if (!mentionsColumn && columns.length > 0) {
      return {
        valid: false,
        reason: `Mentionnez au moins une colonne : ${columns.map(c => c.name).join(', ')}`,
      };
    }
    return { valid: true };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 5 : Lancement — retourne l'ID déjà connu
  // -----------------------------------------------------------------------
  async runAnalysis(file: File, selectedInsights: SuggestedInsight[]): Promise<AnalysisRunResponse> {
    if (!this.currentAnalysisId) {
      throw new Error('Aucune analyse en attente. Veuillez recommencer depuis le début.');
    }
    // /confirm : vérifie le solde, déduit les tokens, lance l’analyse
    const result = await apiFetch<any>(`/analysis/${this.currentAnalysisId}/confirm`, {
      method: 'POST',
    });
    return {
      analysisId: String(result.analysis_id),
      status: 'processing',
    };
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 6 : Suivi de progression — GET /analysis/{id}
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

    if (normalizedStatus === 'processing' || normalizedStatus === 'pending') {
      progress = 50; currentStep = steps[2];
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
}

export const analysisApi = new AnalysisApiService();