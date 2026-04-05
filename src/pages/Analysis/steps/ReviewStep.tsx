/**
 * ÉTAPE 4 : CONFIRMATION & RÉVISION
 *
 * Récapitulatif complet avant le lancement de l'analyse :
 * - Fichier sélectionné
 * - Colonnes détectées
 * - Insights choisis
 * - Coût en jetons + vérification du solde
 */

import React, { useMemo } from 'react';
import {
  FileSpreadsheet,
  Database,
  Sparkles,
  CheckCircle2,
  Play,
  Coins,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { SuggestedInsight, Column, FileValidationResponse } from '../api/analysisApi';
import { useAuth } from '../../../hooks/useAuth';

interface ReviewStepProps {
  file: File;
  fileValidation: FileValidationResponse;
  columns: Column[];
  selectedInsights: SuggestedInsight[];
  onConfirm: () => void;
}

/**
 * Calcule le coût en jetons selon la taille du fichier.
 * - Arrondi à la dizaine supérieure (ex: 23Ko → 30Ko)
 * - 10Ko = 1 jeton (minimum 1)
 * - Ex: 5Ko → 1 jeton | 20Ko → 2 jetons | 23Ko → 3 jetons | 25Ko → 3 jetons
 */
function calculateTokenCost(fileSizeBytes: number): number {
  const sizeKo = fileSizeBytes / 1024;
  if (sizeKo <= 10) return 1;
  // Arrondi à la dizaine supérieure
  const roundedKo = Math.ceil(sizeKo / 10) * 10;
  return roundedKo / 10;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  file,
  fileValidation,
  columns,
  selectedInsights,
  onConfirm
}) => {
  const { user } = useAuth();

  const tokenCost = useMemo(() => calculateTokenCost(file.size), [file.size]);
  const userBalance = user?.token_balance ?? 0;
  const hasEnoughTokens = userBalance >= tokenCost;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vérification finale</h2>
        <p className="text-base-content/70">
          Vérifiez les informations avant de lancer l'analyse
        </p>
      </div>

      {/* Fichier */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="text-success" size={28} />
            <h3 className="text-xl font-semibold">Fichier</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-base-content/60 mb-1">Nom</p>
              <p className="font-semibold">{file.name}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60 mb-1">Taille</p>
              <p className="font-semibold">{(file.size / 1024).toFixed(1)} Ko</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60 mb-1">Feuilles</p>
              <p className="font-semibold">{fileValidation.sheetCount}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60 mb-1">Statut</p>
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={16} />
                <span className="font-semibold">Valide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonnes */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-success" size={28} />
            <h3 className="text-xl font-semibold">Structure des données</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {columns.map((col, idx) => (
              <div key={idx} className="p-3 bg-base-200 rounded-md">
                <p className="font-semibold mb-1">{col.name}</p>
                <span className="badge badge-sm badge-outline">{col.type}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-base-content/60">
            Total : {columns.length} colonne{columns.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-success" size={28} />
            <h3 className="text-xl font-semibold">
              Insights sélectionnés ({selectedInsights.length})
            </h3>
          </div>
          <div className="space-y-2">
            {selectedInsights.map((insight, idx) => (
              <div key={insight.id} className="flex items-start gap-3 p-3 bg-base-200 rounded-md">
                <span className="badge badge-success">{idx + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold mb-1">{insight.title}</p>
                  <p className="text-sm text-base-content/70">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coût en jetons */}
      <div className={`card border shadow-sm ${
        hasEnoughTokens
          ? 'bg-base-100 border-base-300'
          : 'bg-error/5 border-error/30'
      }`}>
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <Coins className={hasEnoughTokens ? 'text-success' : 'text-error'} size={28} />
            <h3 className="text-xl font-semibold">Coût de l'analyse</h3>
          </div>

          <div className="flex items-center justify-between">
            {/* Coût */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-base-content/60 mb-1">Coût de cette analyse</p>
                <p className="text-2xl font-bold text-success">
                  {tokenCost} jeton{tokenCost > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Basé sur {(file.size / 1024).toFixed(1)} Ko
                </p>
              </div>

              {/* Séparateur */}
              <div className="divider divider-horizontal"></div>

              {/* Solde */}
              <div>
                <p className="text-sm text-base-content/60 mb-1">Votre solde</p>
                <p className={`text-2xl font-bold ${hasEnoughTokens ? 'text-base-content' : 'text-error'}`}>
                  {userBalance} jeton{userBalance > 1 ? 's' : ''}
                </p>
                {hasEnoughTokens && (
                  <p className="text-xs text-base-content/50 mt-0.5">
                    Après analyse : {userBalance - tokenCost} jeton{(userBalance - tokenCost) > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Alerte solde insuffisant */}
          {!hasEnoughTokens && (
            <div className="mt-4 alert alert-error">
              <AlertTriangle size={18} />
              <div className="flex-1">
                <p className="font-semibold">Solde insuffisant</p>
                <p className="text-sm mt-1">
                  Il vous manque {tokenCost - userBalance} jeton{(tokenCost - userBalance) > 1 ? 's' : ''} pour lancer cette analyse.
                </p>
              </div>
              <a
                href="https://test.autoi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-error btn-sm gap-2"
              >
                <ExternalLink size={14} />
                Acheter des jetons
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Résumé prêt */}
      {hasEnoughTokens && (
        <div className="alert border border-info/30 bg-info/5">
          <CheckCircle2 className="text-info" />
          <div>
            <h4 className="font-semibold">Prêt pour l'analyse</h4>
            <p className="text-sm">
              L'analyse générera un dashboard interactif avec les {selectedInsights.length} insights sélectionnés.
              Cette opération prendra environ 30 secondes.
            </p>
          </div>
        </div>
      )}

      {/* Bouton de confirmation */}
      <div className="flex justify-center pt-4">
        {hasEnoughTokens ? (
          <button onClick={onConfirm} className="btn btn-success btn-lg">
            <Play size={20} />
            Lancer l'analyse ({tokenCost} jeton{tokenCost > 1 ? 's' : ''})
          </button>
        ) : (
          <a
            href="https://test.autoi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-error btn-lg gap-2"
          >
            <ExternalLink size={20} />
            Acheter des jetons pour continuer
          </a>
        )}
      </div>
    </div>
  );
};