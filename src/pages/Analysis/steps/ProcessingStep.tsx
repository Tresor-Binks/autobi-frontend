/**
 * ÉTAPES 6 & 7 : TRAITEMENT ET RÉSULTAT
<<<<<<< HEAD
 * Déclenche une notification quand l'analyse est terminée.
=======
 * 
 * - Affichage de la progression de l'analyse
 * - Message de succès
 * - Redirection vers le dashboard
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
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
=======
import { 
  Loader, 
  CheckCircle2, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { analysisApi, AnalysisProgressResponse } from '../api/analysisApi';

interface ProcessingStepProps {
  analysisId: string;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ analysisId }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<AnalysisProgressResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    pollProgress();
  }, [analysisId]);

  /**
   * Polling de la progression
   */
  const pollProgress = async () => {
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    const interval = setInterval(async () => {
      try {
        const currentProgress = await analysisApi.getAnalysisProgress(analysisId);
        setProgress(currentProgress);

<<<<<<< HEAD
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
=======
        if (currentProgress.status === 'completed') {
          clearInterval(interval);
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Erreur lors du suivi de progression:', error);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
<<<<<<< HEAD
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
=======
  };

  /**
   * Redirection vers le dashboard
   */
  const handleGoToDashboard = () => {
    // TODO: Créer la page Dashboard
    // navigate(`/dashboard/${analysisId}`);
    
    // Pour l'instant, redirection vers l'historique
    alert('Dashboard en cours de développement. Vous serez redirigé vers l\'historique.');
    navigate('/history');
  };

  if (!progress) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto mb-4 text-success" size={48} />
        <h3 className="text-lg font-semibold mb-2">Initialisation...</h3>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
            <CheckCircle2 className="text-success" size={48} />
          </div>

          <h2 className="text-3xl font-bold mb-3">Analyse terminée avec succès !</h2>
          <p className="text-lg text-base-content/70 mb-8">
            Votre dashboard est prêt à être consulté
          </p>

          <button
            onClick={handleGoToDashboard}
            className="btn btn-success btn-lg"
          >
            <BarChart3 size={20} />
            Accéder au dashboard
            <ArrowRight size={20} />
          </button>

          <div className="mt-8 text-sm text-base-content/60">
            ID de l'analyse : <code className="bg-base-200 px-2 py-1 rounded">{analysisId}</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Analyse en cours</h2>
          <p className="text-base-content/70">
            Veuillez patienter pendant que nous générons votre dashboard
          </p>
        </div>

        {/* Loader animé */}
        <div className="flex justify-center py-8">
          <Loader className="animate-spin text-success" size={64} />
        </div>

        {/* Barre de progression */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{progress.currentStep}</span>
                  <span className="font-bold text-success">{progress.progress}%</span>
                </div>
                <progress
                  className="progress progress-success w-full"
                  value={progress.progress}
                  max="100"
                ></progress>
              </div>

              {/* Étapes */}
              <div className="space-y-2 text-sm">
                {[
                  'Chargement des données...',
                  'Analyse de la structure...',
                  'Génération des insights...',
                  'Création des graphiques...',
                  'Finalisation du dashboard...'
                ].map((step, idx) => {
                  const stepProgress = (idx / 5) * 100;
                  const isCompleted = progress.progress > stepProgress;
                  const isCurrent = progress.currentStep === step;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 ${
                        isCompleted ? 'text-success' : isCurrent ? 'text-base-content' : 'text-base-content/40'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} />
                      ) : isCurrent ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-current rounded-full opacity-30"></div>
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-base-content/60">
          Ne fermez pas cette page pendant l'analyse
        </div>
      </div>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    </div>
  );
};