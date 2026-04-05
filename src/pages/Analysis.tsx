/**
 * PAGE ANALYSIS - WORKFLOW COMPLET D'ANALYSE
<<<<<<< HEAD
 */

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

=======
 * 
 * Cette page orchestre le processus complet d'analyse en 7 étapes :
 * 1. Sélection du fichier Excel
 * 2. Validation & pré-analyse
 * 3. Proposition d'insights par l'IA
 * 4. Sélection des insights (max 6)
 * 5. Confirmation & révision
 * 6. Analyse en cours
 * 7. Résultat et redirection vers dashboard
 * 
 * ARCHITECTURE :
 * - Chaque étape est un composant séparé
 * - Les appels API sont centralisés dans analysisApi.ts
 * - Le code est backend-ready (prêt pour intégration Python)
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle
} from 'lucide-react';

// Import des composants d'étapes
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
import { FileUploadStep } from './Analysis/steps/FileUploadStep';
import { PreAnalysisStep } from './Analysis/steps/PreAnalysisStep';
import { InsightSelectionStep } from './Analysis/steps/InsightSelectionStep';
import { ReviewStep } from './Analysis/steps/ReviewStep';
import { ProcessingStep } from './Analysis/steps/ProcessingStep';

<<<<<<< HEAD
=======
// Import des types API
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
import {
  FileValidationResponse,
  PreAnalysisResponse,
  SuggestedInsight,
  analysisApi
} from './Analysis/api/analysisApi';

<<<<<<< HEAD
import { useAuth } from '../hooks/useAuth';
import { useLayoutContext } from '../layouts/MainLayout';

type Step = 1 | 2 | 3 | 4 | 5 | 6;
=======
// ============================================================================
// TYPES
// ============================================================================

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3

interface StepConfig {
  number: Step;
  label: string;
  description: string;
}

<<<<<<< HEAD
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
=======
// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const Analysis: React.FC = () => {
  // État du workflow
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Données collectées à chaque étape
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<FileValidationResponse | null>(null);
  const [preAnalysis, setPreAnalysis] = useState<PreAnalysisResponse | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<SuggestedInsight[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

<<<<<<< HEAD
=======
  /**
   * Configuration des étapes
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const steps: StepConfig[] = [
    { number: 1, label: 'Fichier', description: 'Sélection' },
    { number: 2, label: 'Structure', description: 'Validation' },
    { number: 3, label: 'Insights', description: 'Sélection' },
    { number: 4, label: 'Révision', description: 'Confirmation' },
    { number: 5, label: 'Analyse', description: 'Traitement' }
  ];

<<<<<<< HEAD
=======
  /**
   * HANDLERS - Transitions entre étapes
   */

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
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

<<<<<<< HEAD
    const tokenCost = calculateTokenCost(selectedFile.size);
    const userBalance = user?.token_balance ?? 0;

    if (userBalance < tokenCost) {
      window.open('https://test.autoi.com', '_blank');
      return;
    }

    setCurrentStep(5);

    try {
=======
    setCurrentStep(5);

    try {
      // Lancement de l'analyse
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      const result = await analysisApi.runAnalysis(selectedFile, selectedInsights);
      setAnalysisId(result.analysisId);
      setCurrentStep(6);
    } catch (error) {
      console.error('Erreur lors du lancement de l\'analyse:', error);
<<<<<<< HEAD
      alert('Erreur lors du lancement de l\'analyse. Veuillez réessayer.');
      setCurrentStep(4);
    }
  };

  const canGoBack = currentStep > 1 && currentStep < 5;

  const handleBack = () => {
    if (canGoBack) setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <FileUploadStep onFileValidated={handleFileValidated} onRequestAuth={onRequestAuth} />;
      case 2:
        return selectedFile ? <PreAnalysisStep file={selectedFile} onAnalysisComplete={handlePreAnalysisComplete} /> : null;
      case 3:
        return preAnalysis ? <InsightSelectionStep columns={preAnalysis.columns} onInsightsSelected={handleInsightsSelected} /> : null;
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
        return (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-lg text-success"></span>
            <p className="mt-4 text-base-content/70">Initialisation de l'analyse...</p>
          </div>
        );
      case 6:
        return analysisId ? <ProcessingStep analysisId={analysisId} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">
        {currentStep < 6 && renderStepper()}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-8">
            {renderCurrentStep()}
          </div>
        </div>
        {currentStep === 3 && selectedInsights.length > 0 && (
          <div className="flex justify-between mt-6">
            {canGoBack && <button onClick={handleBack} className="btn btn-outline">Retour</button>}
            <button onClick={handleNextToReview} className="btn btn-success ml-auto">Continuer</button>
          </div>
        )}
      </div>
    </div>
  );
=======
      alert('Erreur lors du lancement de l\'analyse');
    }
  };

  /**
   * Navigation entre étapes
   */
  const canGoBack = currentStep > 1 && currentStep < 5;

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
    }
  };

  /**
   * Rendu du stepper
   */
  const renderStepper = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isAccessible = step.number <= currentStep;

        return (
          <React.Fragment key={step.number}>
            {/* Étape */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-success border-success text-success-content'
                    : isCurrent
                    ? 'border-success text-success'
                    : 'border-base-300 text-base-content/40'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <span className="font-bold">{step.number}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-success' : 'text-base-content/70'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-base-content/50">{step.description}</p>
              </div>
            </div>

            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-base-300 mx-4 mb-8">
                <div
                  className={`h-full bg-success transition-all duration-500`}
                  style={{
                    width: isCompleted ? '100%' : '0%'
                  }}
                ></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);
};
/**

Rendu de l'étape courante
*/
const renderCurrentStep = () => {
switch (currentStep) {
case 1:
return <FileUploadStep onFileValidated={handleFileValidated} />;
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
return (
<div className="text-center py-12">
<span className="loading loading-spinner loading-lg text-success"></span>
<p className="mt-4 text-base-content/70">Initialisation de l'analyse...</p>
</div>
);
case 6:
return analysisId ? (
<ProcessingStep analysisId={analysisId} />
) : null;
default:
return null;
}
};

return (
<div className="min-h-screen bg-base-200 p-8">
<div className="max-w-6xl mx-auto">
{/* En-tête */}
{/* <div className="text-center mb-12">
<h1 className="text-4xl font-bold mb-2">Nouvelle analyse</h1>
<p className="text-lg text-base-content/70">
Suivez les étapes pour générer votre dashboard d'analyse
</p>
</div> */}
    {/* Stepper */}
    {currentStep < 6 && renderStepper()}

    {/* Contenu de l'étape */}
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-8">
        {renderCurrentStep()}
      </div>
    </div>

    {/* Navigation */}
    {currentStep === 3 && selectedInsights.length > 0 && (
      <div className="flex justify-between mt-6">
        {canGoBack && (
          <button onClick={handleBack} className="btn btn-outline">
            Retour
          </button>
        )}
        <button onClick={handleNextToReview} className="btn btn-success ml-auto">
          Continuer
        </button>
      </div>
    )}
  </div>
</div>
);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
};