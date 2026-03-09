/**
 * PAGE HISTORY
 * Affiche l'historique de toutes les analyses
 */

import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, FileSpreadsheet } from 'lucide-react';
import { apiService } from '../api';
// ✅ Utiliser "import type"
import type { AnalysisHistory } from '../api/types';

export const History: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Chargement de l'historique au montage du composant
   */
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await apiService.getHistory();
      setAnalyses(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">

      <br />
      {/* État vide */}
      {analyses.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center py-12">
            <HistoryIcon className="mx-auto mb-4 text-base-content/40" size={48} />
            <h3 className="text-lg font-semibold mb-2">Aucune analyse pour le moment</h3>
            <p className="text-base-content/60">Vos analyses apparaîtront ici</p>
          </div>
        </div>
      ) : (
        /* Liste des analyses */
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="text-success" size={24} />
                    <div>
                      <h3 className="font-semibold">{analysis.filename}</h3>
                      <p className="text-sm text-base-content/60">
                        {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      analysis.status === 'done' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {analysis.status}
                    </span>
                    <button className="btn btn-sm btn-ghost">
                      Voir les résultats
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};