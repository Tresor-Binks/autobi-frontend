/**
 * PAGE ANALYSIS - WORKFLOW COMPLET D'ANALYSE
 */

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { FileUploadStep } from './Analysis/steps/FileUploadStep';
import { PreAnalysisStep } from './Analysis/steps/PreAnalysisStep';
import { InsightSelectionStep } from './Analysis/steps/InsightSelectionStep';
import { ReviewStep } from './Analysis/steps/ReviewStep';
import { ProcessingStep } from './Analysis/steps/ProcessingStep';

import {
  FileValidationResponse,
  PreAnalysisResponse,
  SuggestedInsight,
  analysisApi
} from './Analysis/api/analysisApi';

import { useAuth } from '../hooks/useAuth';
import { useLayoutContext } from '../layouts/MainLayout';

type Step = 1 | 2 | 3 | 4 | 5;

interface StepConfig {
  number: Step;
  label: string;
  description: string;
}

function calculateTokenCost(fileSizeBytes: number): number {
  const sizeKo = fileSizeBytes / 1024;
  if (sizeKo <= 10) return 1;
  const roundedKo = Math.ceil(sizeKo / 10) * 10;
  return roundedKo / 10;
}

export const Analysis: React.FC = () => {
  const { user } = useAuth();
  const { onRequestAuth } = useLayoutContext();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<FileValidationResponse | null>(null);
  const [preAnalysis, setPreAnalysis] = useState<PreAnalysisResponse | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<SuggestedInsight[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const steps: StepConfig[] = [
    { number: 1, label: 'Fichier',   description: 'Sélection'    },
    { number: 2, label: 'Structure', description: 'Validation'   },
    { number: 3, label: 'Insights',  description: 'Sélection'    },
    { number: 4, label: 'Révision',  description: 'Confirmation' },
    { number: 5, label: 'Analyse',   description: 'Traitement'   },
  ];

  // ── HANDLERS ────────────────────────────────────────────────────────────────

  const handleFileValidated = (file: File, validation: FileValidationResponse) => {
    setSelectedFile(file);
    setFileValidation(validation);
    setCurrentStep(2);
  };

  const handlePreAnalysisComplete = (analysis: PreAnalysisResponse) => {
    setPreAnalysis(analysis);
    setCurrentStep(3);
  };

  const handleInsightsSelected = (insights: SuggestedInsight[]) => {
    setSelectedInsights(insights);
  };

  const handleNextToReview = () => {
    if (selectedInsights.length === 0) {
      alert('Veuillez sélectionner au moins un insight');
      return;
    }
    setCurrentStep(4);
  };

  const handleConfirmAnalysis = async () => {
    if (!selectedFile) return;

    const tokenCost = calculateTokenCost(selectedFile.size);
    const userBalance = user?.token_balance ?? 0;

    if (userBalance < tokenCost) {
      window.open('https://test.autoi.com', '_blank');
      return;
    }

    try {
      // Lance /confirm avec les insights sélectionnés, passe directement au suivi
      const result = await analysisApi.runAnalysis(selectedFile, selectedInsights);
      setAnalysisId(result.analysisId);
      setCurrentStep(5);
    } catch (error: any) {
      console.error('Erreur lors du lancement de l\'analyse:', error);
      alert(error.message || 'Erreur lors du lancement de l\'analyse. Veuillez réessayer.');
    }
  };

  const canGoBack = currentStep > 1 && currentStep < 5;

  const handleBack = () => {
    if (canGoBack) setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  // ── STEPPER ──────────────────────────────────────────────────────────────────

  const renderStepper = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted ? 'bg-success border-success text-success-content'
                    : isCurrent ? 'border-success text-success'
                    : 'border-base-300 text-base-content/40'
                }`}>
                  {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-bold">{step.number}</span>}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-success' : 'text-base-content/70'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-base-content/50">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-base-300 mx-4 mb-8">
                  <div className="h-full bg-success transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // ── RENDU DES ÉTAPES ─────────────────────────────────────────────────────────

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUploadStep
            onFileValidated={handleFileValidated}
            onRequestAuth={onRequestAuth}
          />
        );

      case 2:
        return selectedFile ? (
          <PreAnalysisStep
            file={selectedFile}
            onAnalysisComplete={handlePreAnalysisComplete}
          />
        ) : null;

      case 3:
        return preAnalysis ? (
          <InsightSelectionStep
            columns={preAnalysis.columns}
            suggestedInsights={preAnalysis.suggestedInsights}
            aiSummary={preAnalysis.aiSummary}
            onInsightsSelected={handleInsightsSelected}
          />
        ) : null;

      case 4:
        return selectedFile && fileValidation && preAnalysis ? (
          <ReviewStep
            file={selectedFile}
            fileValidation={fileValidation}
            columns={preAnalysis.columns}
            selectedInsights={selectedInsights}
            onConfirm={handleConfirmAnalysis}
          />
        ) : null;

      case 5:
        return analysisId ? (
          <ProcessingStep analysisId={analysisId} fileName={selectedFile?.name} />
        ) : null;

      default:
        return null;
    }
  };

  // ── RENDU PRINCIPAL ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">
        {currentStep < 5 && renderStepper()}

        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-8">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Boutons de navigation — étape 3 uniquement */}
        {currentStep === 3 && (
          <div className="flex justify-between mt-6">
            {canGoBack && (
              <button onClick={handleBack} className="btn btn-outline">
                Retour
              </button>
            )}
            <button
              onClick={handleNextToReview}
              className="btn btn-success ml-auto"
              disabled={selectedInsights.length === 0}
            >
              Continuer ({selectedInsights.length} insight{selectedInsights.length > 1 ? 's' : ''})
            </button>
          </div>
        )}

        {/* Bouton retour — étapes 2 et 4 */}
        {(currentStep === 2 || currentStep === 4) && canGoBack && (
          <div className="flex mt-6">
            <button onClick={handleBack} className="btn btn-outline">
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};