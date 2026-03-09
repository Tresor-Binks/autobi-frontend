/**
 * ANALYSIS API SERVICE
 * 
 * Ce fichier contient tous les appels API nécessaires pour le workflow d'analyse.
 * Actuellement en mode MOCK pour le développement frontend.
 * 
 * INTÉGRATION BACKEND :
 * - Remplacer baseURL par l'URL du backend Python
 * - Retirer les mockDelay et données simulées
 * - Ajouter la gestion des tokens d'authentification si nécessaire
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

export interface AnalysisRunResponse {
  analysisId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisProgressResponse {
  progress: number; // 0-100
  currentStep: string;
  status: 'processing' | 'completed' | 'failed';
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class AnalysisApiService {
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

    const steps = [
      'Chargement des données...',
      'Analyse de la structure...',
      'Génération des insights...',
      'Création des graphiques...',
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
export const analysisApi = new AnalysisApiService();