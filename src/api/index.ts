/**
 * SERVICE API
 * Gère toutes les communications avec le backend
 * Actuellement en mode MOCK pour développement front-end
 */

import type {
  UploadResponse,
  AnalysisStatus,
  AnalysisResult,
  AnalysisHistory,
  AIResponse
} from './types';

class APIService {
  private baseURL = '/api';

  /**
   * Simule un délai réseau
   */
  private mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Upload d'un fichier Excel
   * POST /api/analysis
   */
  async uploadAnalysis(file: File): Promise<UploadResponse> {
    await this.mockDelay(800);
    
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Stockage local pour simulation
    const analyses = JSON.parse(localStorage.getItem('analyses') || '[]');
    analyses.push({
      id: analysisId,
      filename: file.name,
      uploadDate: new Date().toISOString(),
      status: 'uploaded'
    });
    localStorage.setItem('analyses', JSON.stringify(analyses));
    
    return { analysis_id: analysisId, status: 'uploaded' };
  }

  /**
   * Démarre le traitement d'une analyse
   * POST /api/analysis/{analysis_id}/process
   */
  async startProcessing(analysisId: string): Promise<void> {
    await this.mockDelay(500);
    
    const analyses = JSON.parse(localStorage.getItem('analyses') || '[]');
    const analysis = analyses.find((a: any) => a.id === analysisId);
    if (analysis) {
      analysis.status = 'processing';
      localStorage.setItem('analyses', JSON.stringify(analyses));
    }
  }

  /**
   * Récupère le statut d'une analyse (polling)
   * GET /api/analysis/{analysis_id}/status
   */
  async getStatus(analysisId: string): Promise<AnalysisStatus> {
    await this.mockDelay(300);
    
    // Simulation de progression
    const progress = Math.min(100, (Date.now() % 10000) / 100);
    const steps = ['uploading', 'parsing', 'analyzing', 'generating_insights', 'finalizing'];
    const stepIndex = Math.floor((progress / 100) * steps.length);
    
    return {
      progress: Math.round(progress),
      step: steps[Math.min(stepIndex, steps.length - 1)],
      state: progress >= 100 ? 'done' : 'running'
    };
  }

  /**
   * Récupère les résultats d'une analyse
   * GET /api/analysis/{analysis_id}/result
   */
  async getResult(analysisId: string): Promise<AnalysisResult> {
    await this.mockDelay(600);
    
    return {
      schema: {
        columns: [
          { name: 'Date', type: 'date', sample: ['2024-01-01', '2024-01-02', '2024-01-03'] },
          { name: 'Revenus', type: 'number', sample: [1500, 2300, 1800] },
          { name: 'Dépenses', type: 'number', sample: [800, 1200, 950] },
          { name: 'Catégorie', type: 'string', sample: ['A', 'B', 'A'] }
        ]
      },
      stats: {
        'Revenus': { mean: 1866.67, median: 1800, min: 1500, max: 2300, count: 3 },
        'Dépenses': { mean: 983.33, median: 950, min: 800, max: 1200, count: 3 }
      },
      charts: [
        {
          type: 'bar',
          title: 'Revenus vs Dépenses',
          data: [
            { name: 'Janvier', revenus: 1500, depenses: 800 },
            { name: 'Février', revenus: 2300, depenses: 1200 },
            { name: 'Mars', revenus: 1800, depenses: 950 }
          ]
        }
      ],
      insights: [
        'Les revenus moyens sont de 1866.67€ sur la période analysée',
        'Une croissance de 53% a été observée entre janvier et février',
        'Le ratio dépenses/revenus moyen est de 52.7%, ce qui est sain',
        'La catégorie A représente 66% des transactions'
      ]
    };
  }

  /**
   * Pose une question à l'IA
   * POST /api/analysis/{analysis_id}/ask
   */
  async askQuestion(analysisId: string, question: string): Promise<AIResponse> {
    await this.mockDelay(1200);
    
    return {
      answer: `Basé sur l'analyse de vos données : ${
        question.toLowerCase().includes('revenu') 
          ? 'Les revenus totaux sont de 5600€ avec une moyenne de 1866.67€' 
          : 'Je peux vous aider à analyser ces données. Pouvez-vous préciser votre question ?'
      }`
    };
  }

  /**
   * Récupère l'historique des analyses
   */
  async getHistory(): Promise<AnalysisHistory[]> {
    await this.mockDelay(400);
    return JSON.parse(localStorage.getItem('analyses') || '[]');
  }
}

// Export de l'instance unique
export const apiService = new APIService();
