/**
 * ANALYSIS API SERVICE
<<<<<<< HEAD
 * Connecté au backend FastAPI Python.
=======
 * 
 * Ce fichier contient tous les appels API nécessaires pour le workflow d'analyse.
 * Actuellement en mode MOCK pour le développement frontend.
 * 
 * INTÉGRATION BACKEND :
 * - Remplacer baseURL par l'URL du backend Python
 * - Retirer les mockDelay et données simulées
 * - Ajouter la gestion des tokens d'authentification si nécessaire
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
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
<<<<<<< HEAD
  warnings?: string[];
=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
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
<<<<<<< HEAD
  dataset_id?: string;
  metadata?: any;
=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
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

<<<<<<< HEAD
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

=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
export interface AnalysisRunResponse {
  analysisId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisProgressResponse {
<<<<<<< HEAD
  progress: number;
=======
  progress: number; // 0-100
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  currentStep: string;
  status: 'processing' | 'completed' | 'failed';
}

// ============================================================================
<<<<<<< HEAD
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
=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
// API SERVICE CLASS
// ============================================================================

class AnalysisApiService {
<<<<<<< HEAD
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
    if (this.currentAnalysisId) {
      return {
        analysisId: String(this.currentAnalysisId),
        status: 'processing',
      };
    }
    const analyses = await apiFetch<any[]>('/analysis/');
    const latest = analyses[0];
    if (latest) {
      return {
        analysisId: String(latest.id),
        status: latest.status?.toLowerCase() === 'completed' ? 'completed' : 'processing',
      };
    }
    throw new Error('Aucune analyse trouvée');
  }

  // -----------------------------------------------------------------------
  // ÉTAPE 6 : Suivi de progression — GET /analysis/{id}
  // -----------------------------------------------------------------------
  async getAnalysisProgress(analysisId: string): Promise<AnalysisProgressResponse> {
    const data = await apiFetch<any>(`/analysis/${analysisId}`);
    const normalizedStatus = data.status?.toLowerCase();
=======
  private baseURL = '/api'; // À remplacer par l'URL backend Python
  private mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * ÉTAPE 1 : Validation du fichier
   * POST /api/file/validate
   */
  async validateFile(file: File): Promise<FileValidationResponse> {
    await this.mockDelay(800);

    // Validation côté client
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10 Mo

    const errors: string[] = [];

    if (!validExtensions.includes(extension)) {
      errors.push('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
    }

    if (file.size > maxSize) {
      errors.push('Fichier trop volumineux. Taille maximale : 10 Mo');
    }

    // MOCK : Simulation réponse backend
    return {
      valid: errors.length === 0,
      fileName: file.name,
      fileSize: file.size,
      sheetCount: 1, // Simulé
      errors: errors.length > 0 ? errors : undefined
    };

    /* BACKEND INTEGRATION:
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${this.baseURL}/file/validate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
    */
  }

  /**
   * ÉTAPE 2 : Pré-analyse du fichier
   * POST /api/file/pre-analyze
   */
  async preAnalyzeFile(file: File): Promise<PreAnalysisResponse> {
    await this.mockDelay(1500);

    // MOCK : Données simulées
    return {
      columns: [
        {
          name: 'Date',
          type: 'date',
          sampleValues: ['2024-01-01', '2024-01-02', '2024-01-03'],
          nullCount: 0
        },
        {
          name: 'Revenus',
          type: 'number',
          sampleValues: [1500, 2300, 1800],
          nullCount: 0
        },
        {
          name: 'Dépenses',
          type: 'number',
          sampleValues: [800, 1200, 950],
          nullCount: 1
        },
        {
          name: 'Catégorie',
          type: 'text',
          sampleValues: ['A', 'B', 'A'],
          nullCount: 0
        },
        {
          name: 'Actif',
          type: 'boolean',
          sampleValues: [true, true, false],
          nullCount: 0
        }
      ],
      rowCount: 156,
      hasHeaders: true,
      dataQuality: 'good',
      warnings: []
    };

    /* BACKEND INTEGRATION:
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${this.baseURL}/file/pre-analyze`, formData);
    return response.data;
    */
  }

  /**
   * ÉTAPE 3 : Suggestions d'insights par l'IA
   * POST /api/ai/suggest-insights
   */
  async suggestInsights(columns: Column[]): Promise<SuggestedInsight[]> {
    await this.mockDelay(2000);

    // MOCK : Insights suggérés
    return [
      {
        id: 'insight_1',
        title: 'Évolution des revenus dans le temps',
        description: 'Analyse de la tendance des revenus sur la période',
        type: 'trend',
        feasibility: 'high',
        requiredColumns: ['Date', 'Revenus']
      },
      {
        id: 'insight_2',
        title: 'Comparaison Revenus vs Dépenses',
        description: 'Ratio et comparaison entre revenus et dépenses',
        type: 'comparison',
        feasibility: 'high',
        requiredColumns: ['Revenus', 'Dépenses']
      },
      {
        id: 'insight_3',
        title: 'Total des revenus par catégorie',
        description: 'Agrégation des revenus par type de catégorie',
        type: 'total',
        feasibility: 'high',
        requiredColumns: ['Catégorie', 'Revenus']
      },
      {
        id: 'insight_4',
        title: 'Détection d\'anomalies dans les dépenses',
        description: 'Identification des valeurs aberrantes',
        type: 'anomaly',
        feasibility: 'medium',
        requiredColumns: ['Dépenses']
      },
      {
        id: 'insight_5',
        title: 'Distribution des catégories',
        description: 'Répartition en pourcentage des différentes catégories',
        type: 'distribution',
        feasibility: 'high',
        requiredColumns: ['Catégorie']
      },
      {
        id: 'insight_6',
        title: 'Moyenne mobile des revenus',
        description: 'Calcul de la moyenne mobile sur 7 jours',
        type: 'trend',
        feasibility: 'medium',
        requiredColumns: ['Date', 'Revenus']
      },
      {
        id: 'insight_7',
        title: 'Taux de croissance mensuel',
        description: 'Évolution en pourcentage mois par mois',
        type: 'trend',
        feasibility: 'high',
        requiredColumns: ['Date', 'Revenus']
      },
      {
        id: 'insight_8',
        title: 'Comparaison avec moyenne historique',
        description: 'Écart par rapport à la moyenne globale',
        type: 'comparison',
        feasibility: 'high',
        requiredColumns: ['Revenus']
      }
    ];

    /* BACKEND INTEGRATION:
    const response = await axios.post(`${this.baseURL}/ai/suggest-insights`, {
      columns: columns.map(col => ({
        name: col.name,
        type: col.type
      }))
    });
    
    return response.data.insights;
    */
  }

  /**
   * ÉTAPE 4 : Validation d'un insight personnalisé
   * POST /api/ai/validate-insights
   */
  async validateInsight(
    insightDescription: string,
    columns: Column[]
  ): Promise<InsightValidationResponse> {
    await this.mockDelay(1000);

    // MOCK : Validation simple
    if (insightDescription.length < 10) {
      return {
        valid: false,
        reason: 'La description est trop courte. Soyez plus précis.'
      };
    }

    return {
      valid: true
    };

    /* BACKEND INTEGRATION:
    const response = await axios.post(`${this.baseURL}/ai/validate-insights`, {
      description: insightDescription,
      availableColumns: columns.map(col => col.name)
    });
    
    return response.data;
    */
  }

  /**
   * ÉTAPE 5 : Lancement de l'analyse
   * POST /api/analyze/run
   */
  async runAnalysis(
    file: File,
    selectedInsights: SuggestedInsight[]
  ): Promise<AnalysisRunResponse> {
    await this.mockDelay(1000);

    // MOCK : ID d'analyse généré
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      analysisId,
      status: 'queued'
    };

    /* BACKEND INTEGRATION:
    const formData = new FormData();
    formData.append('file', file);
    formData.append('insights', JSON.stringify(selectedInsights.map(i => i.id)));
    
    const response = await axios.post(`${this.baseURL}/analyze/run`, formData);
    return response.data;
    */
  }

  /**
   * ÉTAPE 6 : Suivi de progression de l'analyse
   * GET /api/analyze/progress/:analysisId
   */
  async getAnalysisProgress(analysisId: string): Promise<AnalysisProgressResponse> {
    await this.mockDelay(500);

    // MOCK : Simulation de progression
    const now = Date.now();
    const elapsed = now % 10000; // Cycle de 10 secondes
    const progress = Math.min(100, Math.floor((elapsed / 10000) * 100));
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3

    const steps = [
      'Chargement des données...',
      'Analyse de la structure...',
      'Génération des insights...',
      'Création des graphiques...',
<<<<<<< HEAD
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

=======
      'Finalisation du dashboard...'
    ];

    const stepIndex = Math.floor((progress / 100) * steps.length);

    return {
      progress,
      currentStep: steps[Math.min(stepIndex, steps.length - 1)],
      status: progress >= 100 ? 'completed' : 'processing'
    };

    /* BACKEND INTEGRATION:
    const response = await axios.get(`${this.baseURL}/analyze/progress/${analysisId}`);
    return response.data;
    */
  }
}

// Export de l'instance unique
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
export const analysisApi = new AnalysisApiService();