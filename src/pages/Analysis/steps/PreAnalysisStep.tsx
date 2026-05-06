/**
 * ÉTAPE 2 : UPLOAD & PRÉ-ANALYSE
 *
 * Appelle POST /analysis/upload qui :
 *   1. Lit et convertit le fichier Excel
 *   2. Appelle GPT-4o-mini (max 3 min côté backend)
 *   3. Retourne métadonnées + suggested_insights + ai_summary
 *
 * Le loading spinner reste affiché pendant tout l'appel IA.
 * En cas d'erreur (timeout 3 min notamment), un message clair est affiché.
 */

import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle2, AlertTriangle, Loader, Sparkles } from 'lucide-react';
import { analysisApi, PreAnalysisResponse, Column } from '../api/analysisApi';

interface PreAnalysisStepProps {
  file: File;
  onAnalysisComplete: (analysis: PreAnalysisResponse) => void;
}

export const PreAnalysisStep: React.FC<PreAnalysisStepProps> = ({ file, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState<PreAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<'upload' | 'ai'>('upload');

  useEffect(() => {
    performPreAnalysis();
  }, [file]);

  const performPreAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingStage('upload');

    try {
      // Petit délai pour afficher "lecture du fichier" avant de basculer sur le message IA
      setTimeout(() => setLoadingStage('ai'), 1500);

      const result = await analysisApi.preAnalyzeFile(file);
      setAnalysis(result);
      onAnalysisComplete(result);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('3 minutes') || msg.includes('504') || msg.includes('timeout')) {
        setError("L'analyse IA a dépassé 3 minutes. Veuillez réessayer avec un fichier plus petit, ou réessayer dans quelques instants.");
      } else {
        setError(msg || 'Erreur lors de l\'analyse du fichier.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: Column['type']) => {
    const colors = {
      text: 'badge-info',
      number: 'badge-success',
      date: 'badge-warning',
      boolean: 'badge-accent',
    };
    return <span className={`badge badge-sm ${colors[type]}`}>{type}</span>;
  };

  const getQualityBadge = (quality: 'good' | 'fair' | 'poor') => {
    const config = {
      good: { label: 'Excellente', class: 'badge-success', icon: CheckCircle2 },
      fair: { label: 'Correcte', class: 'badge-warning', icon: AlertTriangle },
      poor: { label: 'Médiocre', class: 'badge-error', icon: AlertTriangle },
    };
    const { label, class: badgeClass, icon: Icon } = config[quality];
    return (
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span className={`badge ${badgeClass}`}>{label}</span>
      </div>
    );
  };

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <Loader className="animate-spin mx-auto text-success" size={48} />
        {loadingStage === 'upload' ? (
          <>
            <h3 className="text-lg font-semibold">Lecture du fichier...</h3>
            <p className="text-base-content/60">Détection de la structure et des types de données</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold">Analyse IA en cours...</h3>
            <p className="text-base-content/60">
              GPT-4o-mini génère vos insights personnalisés
            </p>
            <p className="text-sm text-base-content/40">
              Cette étape peut prendre jusqu'à 1 minute
            </p>
          </>
        )}
      </div>
    );
  }

  // ── ERREUR ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-4">
        <div className="alert alert-error">
          <AlertTriangle />
          <div>
            <p className="font-semibold">Erreur lors de l'analyse</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <button onClick={performPreAnalysis} className="btn btn-success">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // ── RÉSULTAT ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Structure détectée</h2>
        <p className="text-base-content/70">
          Vérifiez que les colonnes et types sont correctement identifiés
        </p>
      </div>

      {/* Résumé IA */}
      {analysis.aiSummary && (
        <div className="alert bg-success/5 border border-success/20">
          <Sparkles size={18} className="text-success flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-success mb-1">Résumé GPT-4o-mini</p>
            <p className="text-sm text-base-content/80">{analysis.aiSummary}</p>
          </div>
        </div>
      )}

      {/* Résumé chiffres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-base-content/60">Lignes</span>
              <span className="text-2xl font-bold">{analysis.rowCount.toLocaleString()}</span>
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

      {/* Insights générés */}
      {analysis.suggestedInsights.length > 0 && (
        <div className="alert bg-success/5 border border-success/20">
          <CheckCircle2 size={18} className="text-success flex-shrink-0" />
          <span className="text-sm">
            <strong>{analysis.suggestedInsights.length} insights</strong> générés par GPT-4o-mini — prêts à sélectionner à l'étape suivante.
          </span>
        </div>
      )}

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