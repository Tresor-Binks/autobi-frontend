/**
 * ÉTAPE 2 : VALIDATION & PRÉ-ANALYSE
 * 
 * Affiche les colonnes détectées et leurs types.
 * Permet de vérifier la structure avant de continuer.
 */

import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle2, AlertTriangle, Loader } from 'lucide-react';
import { analysisApi, PreAnalysisResponse, Column } from '../api/analysisApi';

interface PreAnalysisStepProps {
  file: File;
  onAnalysisComplete: (analysis: PreAnalysisResponse) => void;
}

export const PreAnalysisStep: React.FC<PreAnalysisStepProps> = ({ file, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState<PreAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    performPreAnalysis();
  }, [file]);

  const performPreAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analysisApi.preAnalyzeFile(file);
      setAnalysis(result);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Erreur lors de la pré-analyse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Badge de type de colonne
   */
  const getTypeBadge = (type: Column['type']) => {
    const colors = {
      text: 'badge-info',
      number: 'badge-success',
      date: 'badge-warning',
      boolean: 'badge-accent'
    };

    return <span className={`badge badge-sm ${colors[type]}`}>{type}</span>;
  };

  /**
   * Indicateur de qualité
   */
  const getQualityBadge = (quality: 'good' | 'fair' | 'poor') => {
    const config = {
      good: { label: 'Excellente', class: 'badge-success', icon: CheckCircle2 },
      fair: { label: 'Correcte', class: 'badge-warning', icon: AlertTriangle },
      poor: { label: 'Médiocre', class: 'badge-error', icon: AlertTriangle }
    };

    const { label, class: badgeClass, icon: Icon } = config[quality];

    return (
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span className={`badge ${badgeClass}`}>{label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto mb-4 text-success" size={48} />
        <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
        <p className="text-base-content/60">
          Détection de la structure et des types de données
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="alert alert-error">
        <AlertTriangle />
        <span>Erreur lors de l'analyse du fichier</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Structure détectée</h2>
        <p className="text-base-content/70">
          Vérifiez que les colonnes et types sont correctement identifiés
        </p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/60">Lignes</span>
              <span className="text-2xl font-bold">{analysis.rowCount}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/60">Colonnes</span>
              <span className="text-2xl font-bold">{analysis.columns.length}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/60">Qualité</span>
              {getQualityBadge(analysis.dataQuality)}
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle />
          <div>
            <h4 className="font-semibold">Avertissements</h4>
            <ul className="text-sm mt-1">
              {analysis.warnings.map((warning, idx) => (
                <li key={idx}>• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Colonnes détectées */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="text-success" size={24} />
            <h3 className="text-xl font-semibold">Colonnes détectées</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom de la colonne</th>
                  <th>Type</th>
                  <th>Échantillon</th>
                  <th>Valeurs nulles</th>
                </tr>
              </thead>
              <tbody>
                {analysis.columns.map((column, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold">{column.name}</td>
                    <td>{getTypeBadge(column.type)}</td>
                    <td className="text-sm text-base-content/60">
                      {column.sampleValues.slice(0, 3).join(', ')}
                    </td>
                    <td>
                      {column.nullCount > 0 ? (
                        <span className="text-warning">{column.nullCount}</span>
                      ) : (
                        <span className="text-success">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};