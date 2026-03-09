/**
 * ÉTAPE 5 : CONFIRMATION & RÉVISION
 * 
 * Récapitulatif complet avant le lancement de l'analyse :
 * - Fichier sélectionné
 * - Colonnes détectées
 * - Insights choisis
 */

import React from 'react';
import { 
  FileSpreadsheet, 
  Database, 
  Sparkles, 
  CheckCircle2,
  Play
} from 'lucide-react';
import { SuggestedInsight, Column, FileValidationResponse } from '../api/analysisApi';

interface ReviewStepProps {
  file: File;
  fileValidation: FileValidationResponse;
  columns: Column[];
  selectedInsights: SuggestedInsight[];
  onConfirm: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  file,
  fileValidation,
  columns,
  selectedInsights,
  onConfirm
}) => {
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
              <p className="font-semibold">{(file.size / 1024).toFixed(2)} Ko</p>
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
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 bg-base-200 rounded-md"
              >
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

      {/* Informations */}
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

      {/* Bouton de confirmation */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onConfirm}
          className="btn btn-success btn-lg"
        >
          <Play size={20} />
          Lancer l'analyse
        </button>
      </div>
    </div>
  );
};