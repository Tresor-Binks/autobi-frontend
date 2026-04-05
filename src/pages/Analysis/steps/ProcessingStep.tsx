/**
 * ÉTAPES 6 & 7 : TRAITEMENT ET RÉSULTAT
 * Déclenche une notification quand l'analyse est terminée.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';
import { analysisApi, AnalysisProgressResponse } from '../api/analysisApi';
import { notifyAnalysisComplete, notifyAnalysisFailed } from '../../../store/notifications';

interface ProcessingStepProps {
  analysisId: string;
  fileName?: string;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ analysisId, fileName }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<AnalysisProgressResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentProgress = await analysisApi.getAnalysisProgress(analysisId);
        setProgress(currentProgress);

        if (currentProgress.status === 'completed' && !notified) {
          clearInterval(interval);
          setIsCompleted(true);
          setNotified(true);
          notifyAnalysisComplete(fileName || 'Fichier', Number(analysisId));
        }

        if (currentProgress.status === 'failed' && !notified) {
          clearInterval(interval);
          setNotified(true);
          notifyAnalysisFailed(fileName || 'Fichier');
        }
      } catch (error) {
        console.error('Erreur suivi progression:', error);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [analysisId, notified]);

  const handleGoToDashboard = () => navigate(`/dashboard/${analysisId}`);

  if (!progress) return (
    <div className="text-center py-12">
      <Loader className="animate-spin mx-auto mb-4 text-success" size={48} />
      <h3 className="text-lg font-semibold mb-2">Initialisation...</h3>
    </div>
  );

  if (isCompleted) return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
        <CheckCircle2 className="text-success" size={48} />
      </div>
      <h2 className="text-3xl font-bold mb-3">Analyse terminée !</h2>
      <p className="text-lg text-base-content/70 mb-8">Votre dashboard est prêt à être consulté</p>
      <button onClick={handleGoToDashboard} className="btn btn-success btn-lg">
        <BarChart3 size={20} />Accéder au dashboard<ArrowRight size={20} />
      </button>
      <div className="mt-8 text-sm text-base-content/60">
        ID : <code className="bg-base-200 px-2 py-1 rounded">{analysisId}</code>
      </div>
    </div>
  );

  const steps = ['Chargement des données...','Analyse de la structure...','Génération des insights...','Création des graphiques...','Finalisation du dashboard...'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Analyse en cours</h2>
        <p className="text-base-content/70">Veuillez patienter</p>
      </div>
      <div className="flex justify-center py-8">
        <Loader className="animate-spin text-success" size={64} />
      </div>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{progress.currentStep}</span>
              <span className="font-bold text-success">{progress.progress}%</span>
            </div>
            <progress className="progress progress-success w-full" value={progress.progress} max="100" />
          </div>
          <div className="space-y-2 text-sm">
            {steps.map((step, idx) => {
              const done = progress.progress > (idx / 5) * 100;
              const current = progress.currentStep === step;
              return (
                <div key={idx} className={`flex items-center gap-2 ${done ? 'text-success' : current ? 'text-base-content' : 'text-base-content/40'}`}>
                  {done ? <CheckCircle2 size={16} /> : current ? <Loader className="animate-spin" size={16} /> : <div className="w-4 h-4 border-2 border-current rounded-full opacity-30" />}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-base-content/60">Ne fermez pas cette page</div>
    </div>
  );
};