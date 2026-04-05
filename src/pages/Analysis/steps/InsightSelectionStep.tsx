/**
 * ÉTAPES 3 & 4 : PROPOSITION ET SÉLECTION D'INSIGHTS
<<<<<<< HEAD
 */

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Plus,
  Check,
  Loader,
  X,
  WifiOff,
  Cpu,
  Zap
} from 'lucide-react';
import {
  analysisApi,
  SuggestedInsight,
  Column,
=======
 * 
 * - L'IA propose des insights basés sur les colonnes détectées
 * - L'utilisateur sélectionne jusqu'à 6 insights maximum
 * - Possibilité d'ajouter des insights personnalisés
 */

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  AlertCircle, 
  Plus,
  Check,
  Loader,
  X
} from 'lucide-react';
import { 
  analysisApi, 
  SuggestedInsight, 
  Column,
  InsightValidationResponse 
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
} from '../api/analysisApi';

interface InsightSelectionStepProps {
  columns: Column[];
  onInsightsSelected: (insights: SuggestedInsight[]) => void;
}

<<<<<<< HEAD
interface CustomValidationResult {
  status: 'idle' | 'loading' | 'valid' | 'invalid' | 'error';
  reformulatedTitle?: string;
  reformulatedDescription?: string;
  requiredColumns?: string[];
  type?: SuggestedInsight['type'];
  feasibility?: SuggestedInsight['feasibility'];
  reason?: string;
  error?: string;
}

const MAX_INSIGHTS = 6;

export const InsightSelectionStep: React.FC<InsightSelectionStepProps> = ({
  columns,
  onInsightsSelected
=======
const MAX_INSIGHTS = 6;

export const InsightSelectionStep: React.FC<InsightSelectionStepProps> = ({ 
  columns, 
  onInsightsSelected 
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
}) => {
  const [suggestedInsights, setSuggestedInsights] = useState<SuggestedInsight[]>([]);
  const [selectedInsights, setSelectedInsights] = useState<SuggestedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
  const [isAIGenerated, setIsAIGenerated] = useState<boolean | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInsightText, setCustomInsightText] = useState('');
  const [validationResult, setValidationResult] = useState<CustomValidationResult>({ status: 'idle' });
=======
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInsightText, setCustomInsightText] = useState('');
  const [isValidatingCustom, setIsValidatingCustom] = useState(false);
  const [customValidation, setCustomValidation] = useState<InsightValidationResponse | null>(null);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3

  useEffect(() => {
    loadSuggestions();
  }, [columns]);

  useEffect(() => {
    onInsightsSelected(selectedInsights);
  }, [selectedInsights]);

<<<<<<< HEAD
=======
  /**
   * Chargement des suggestions d'insights
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const insights = await analysisApi.suggestInsights(columns);
      setSuggestedInsights(insights);
<<<<<<< HEAD

      // Source fiable : propriété exposée par le service après analyse du summary OpenAI
      setIsAIGenerated(analysisApi.lastInsightsFromAI);
    } catch (error) {
      console.error('Erreur chargement suggestions:', error);
      setIsAIGenerated(false);
=======
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const toggleInsight = (insight: SuggestedInsight) => {
    const isSelected = selectedInsights.some(i => i.id === insight.id);
    if (isSelected) {
      setSelectedInsights(prev => prev.filter(i => i.id !== insight.id));
    } else {
      if (selectedInsights.length >= MAX_INSIGHTS) return;
=======
  /**
   * Toggle sélection d'un insight
   */
  const toggleInsight = (insight: SuggestedInsight) => {
    const isSelected = selectedInsights.some(i => i.id === insight.id);

    if (isSelected) {
      setSelectedInsights(prev => prev.filter(i => i.id !== insight.id));
    } else {
      if (selectedInsights.length >= MAX_INSIGHTS) {
        alert(`Vous ne pouvez sélectionner que ${MAX_INSIGHTS} insights maximum`);
        return;
      }
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      setSelectedInsights(prev => [...prev, insight]);
    }
  };

<<<<<<< HEAD
  const handleValidateCustomInsight = async () => {
    if (!customInsightText.trim()) return;
    setValidationResult({ status: 'loading' });

    try {
      const result = await analysisApi.validateCustomInsight(customInsightText);

      if (result.error) {
        setValidationResult({ status: 'error', error: result.error });
        return;
      }

      if (result.valid) {
        setValidationResult({
          status: 'valid',
          reformulatedTitle: result.reformulated_title,
          reformulatedDescription: result.reformulated_description,
          requiredColumns: result.required_columns,
          type: result.type,
          feasibility: result.feasibility,
        });
      } else {
        setValidationResult({
          status: 'invalid',
          reason: result.reason || "Cet insight n'est pas réalisable avec les données disponibles.",
        });
      }
    } catch (error: any) {
      setValidationResult({
        status: 'error',
        error: "Service d'analyse indisponible. Veuillez réessayer plus tard."
      });
    }
  };

  const handleAddValidatedInsight = () => {
    if (validationResult.status !== 'valid') return;
    if (selectedInsights.length >= MAX_INSIGHTS) return;

    const newInsight: SuggestedInsight = {
      id: `custom_${Date.now()}`,
      title: validationResult.reformulatedTitle || customInsightText,
      description: validationResult.reformulatedDescription || customInsightText,
      type: validationResult.type || 'comparison',
      feasibility: validationResult.feasibility || 'medium',
      requiredColumns: validationResult.requiredColumns || [],
    };

    setSelectedInsights(prev => [...prev, newInsight]);
    setCustomInsightText('');
    setShowCustomForm(false);
    setValidationResult({ status: 'idle' });
  };

  const handleCancelCustom = () => {
    setShowCustomForm(false);
    setCustomInsightText('');
    setValidationResult({ status: 'idle' });
  };

=======
  /**
   * Validation et ajout d'un insight personnalisé
   */
  const handleAddCustomInsight = async () => {
    if (!customInsightText.trim()) return;

    setIsValidatingCustom(true);
    setCustomValidation(null);

    try {
      const validation = await analysisApi.validateInsight(customInsightText, columns);
      setCustomValidation(validation);

      if (validation.valid) {
        if (selectedInsights.length >= MAX_INSIGHTS) {
          alert(`Vous ne pouvez sélectionner que ${MAX_INSIGHTS} insights maximum`);
          return;
        }

        const customInsight: SuggestedInsight = {
          id: `custom_${Date.now()}`,
          title: 'Insight personnalisé',
          description: customInsightText,
          type: 'comparison',
          feasibility: 'medium',
          requiredColumns: []
        };

        setSelectedInsights(prev => [...prev, customInsight]);
        setCustomInsightText('');
        setShowCustomForm(false);
        setCustomValidation(null);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsValidatingCustom(false);
    }
  };

  /**
   * Icône selon le type d'insight
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const getInsightIcon = (type: SuggestedInsight['type']) => {
    const icons = {
      trend: TrendingUp,
      comparison: BarChart3,
      total: BarChart3,
      anomaly: AlertCircle,
      distribution: BarChart3
    };
<<<<<<< HEAD
=======

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    const Icon = icons[type] || BarChart3;
    return <Icon size={20} className="text-success" />;
  };

<<<<<<< HEAD
=======
  /**
   * Badge de faisabilité
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const getFeasibilityBadge = (feasibility: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'Facile', class: 'badge-success' },
      medium: { label: 'Moyen', class: 'badge-warning' },
      low: { label: 'Difficile', class: 'badge-error' }
    };
<<<<<<< HEAD
=======

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    const { label, class: badgeClass } = config[feasibility];
    return <span className={`badge badge-sm ${badgeClass}`}>{label}</span>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto mb-4 text-success" size={48} />
<<<<<<< HEAD
        <h3 className="text-lg font-semibold mb-2">Analyse de vos données en cours...</h3>
        <p className="text-base-content/60">Génération d'insights pertinents basés sur votre fichier</p>
=======
        <h3 className="text-lg font-semibold mb-2">L'IA analyse vos données...</h3>
        <p className="text-base-content/60">
          Génération d'insights pertinents basés sur votre fichier
        </p>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      </div>
    );
  }

  return (
    <div className="space-y-6">
<<<<<<< HEAD

=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Sélectionnez vos insights</h2>
          <p className="text-base-content/70">
            Choisissez jusqu'à {MAX_INSIGHTS} insights à générer pour votre dashboard
          </p>
        </div>
<<<<<<< HEAD
=======

        {/* Compteur */}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
        <div className="text-right">
          <div className="text-3xl font-bold">
            <span className={selectedInsights.length >= MAX_INSIGHTS ? 'text-warning' : 'text-success'}>
              {selectedInsights.length}
            </span>
            <span className="text-base-content/40"> / {MAX_INSIGHTS}</span>
          </div>
          <p className="text-sm text-base-content/60">insights sélectionnés</p>
        </div>
      </div>

<<<<<<< HEAD
      {/* Alerte limite atteinte */}
      {selectedInsights.length >= MAX_INSIGHTS && (
        <div className="alert alert-warning">
          <AlertCircle size={18} />
          <span>Limite de {MAX_INSIGHTS} insights atteinte. Désélectionnez-en pour en ajouter d'autres.</span>
=======
      {/* Message si limite atteinte */}
      {selectedInsights.length >= MAX_INSIGHTS && (
        <div className="alert alert-warning">
          <AlertCircle />
          <span>
            Vous avez atteint la limite de {MAX_INSIGHTS} insights. 
            Désélectionnez-en pour en choisir d'autres.
          </span>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
        </div>
      )}

      {/* Insights suggérés */}
      <div>
<<<<<<< HEAD
        {/* En-tête avec badge source subtil */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-success" size={24} />
            <h3 className="text-xl font-semibold">Suggestions</h3>
          </div>

          {/* Badge discret IA / automatique */}
          {isAIGenerated !== null && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isAIGenerated
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-base-200 text-base-content/50 border border-base-300'
            }`}>
              {isAIGenerated ? (
                <>
                  <Zap size={11} />
                  Générés par l'IA
                </>
              ) : (
                <>
                  <Cpu size={11} />
                  Générés automatiquement
                </>
              )}
            </div>
          )}
=======
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-success" size={24} />
          <h3 className="text-xl font-semibold">Suggestions de l'IA</h3>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedInsights.map((insight) => {
            const isSelected = selectedInsights.some(i => i.id === insight.id);
<<<<<<< HEAD
=======

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
            return (
              <div
                key={insight.id}
                onClick={() => toggleInsight(insight)}
                className={`card cursor-pointer transition-all border-2 ${
<<<<<<< HEAD
                  isSelected ? 'border-success bg-success/5' : 'border-base-300 hover:border-success/50'
=======
                  isSelected
                    ? 'border-success bg-success/5'
                    : 'border-base-300 hover:border-success/50'
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm text-base-content/70">{insight.description}</p>
                      </div>
                    </div>
<<<<<<< HEAD
                    {isSelected && (
                      <div className="bg-success text-success-content rounded-full p-1 flex-shrink-0">
=======

                    {isSelected && (
                      <div className="bg-success text-success-content rounded-full p-1">
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                        <Check size={16} />
                      </div>
                    )}
                  </div>
<<<<<<< HEAD
                  <div className="flex items-center justify-between mt-2">
                    {getFeasibilityBadge(insight.feasibility)}
                    {insight.requiredColumns.length > 0 && (
                      <span className="text-xs text-base-content/40">
=======

                  <div className="flex items-center justify-between mt-2">
                    {getFeasibilityBadge(insight.feasibility)}
                    {insight.requiredColumns.length > 0 && (
                      <span className="text-xs text-base-content/50">
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                        {insight.requiredColumns.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ajouter un insight personnalisé */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Ajouter un insight personnalisé</h3>
<<<<<<< HEAD
            {!showCustomForm ? (
              <button
                onClick={() => setShowCustomForm(true)}
                className="btn btn-sm btn-outline btn-success"
                disabled={selectedInsights.length >= MAX_INSIGHTS}
              >
                <Plus size={16} />
                Ajouter
              </button>
            ) : (
              <button onClick={handleCancelCustom} className="btn btn-sm btn-ghost">
                <X size={16} />
                Annuler
              </button>
            )}
=======
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="btn btn-sm btn-outline btn-success"
              disabled={selectedInsights.length >= MAX_INSIGHTS}
            >
              {showCustomForm ? <X size={16} /> : <Plus size={16} />}
              {showCustomForm ? 'Annuler' : 'Ajouter'}
            </button>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
          </div>

          {showCustomForm && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
<<<<<<< HEAD
                  <span className="label-text">Décrivez ce que vous voulez analyser</span>
                </label>
                <textarea
                  value={customInsightText}
                  onChange={(e) => {
                    setCustomInsightText(e.target.value);
                    if (validationResult.status !== 'idle') {
                      setValidationResult({ status: 'idle' });
                    }
                  }}
                  placeholder="Ex: Je voudrais voir comment les ventes évoluent selon les régions, ou comparer les profits par produit..."
                  className="textarea textarea-bordered h-24"
                  disabled={validationResult.status === 'loading'}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Décrivez librement — pas besoin de connaître les noms des colonnes
=======
                  <span className="label-text">Décrivez votre insight</span>
                </label>
                <textarea
                  value={customInsightText}
                  onChange={(e) => setCustomInsightText(e.target.value)}
                  placeholder="Ex: Comparer les ventes de 2024 par rapport à 2023 par trimestre"
                  className="textarea textarea-bordered h-24"
                  disabled={isValidatingCustom}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    L'IA vérifiera si cet insight est réalisable avec vos données
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                  </span>
                </label>
              </div>

<<<<<<< HEAD
              {/* Résultat valide */}
              {validationResult.status === 'valid' && (
                <div className="alert alert-success">
                  <Check size={18} />
                  <div className="flex-1">
                    <p className="font-semibold">{validationResult.reformulatedTitle}</p>
                    <p className="text-sm mt-1">{validationResult.reformulatedDescription}</p>
                    {validationResult.requiredColumns && validationResult.requiredColumns.length > 0 && (
                      <p className="text-xs mt-1 opacity-70">
                        Colonnes : {validationResult.requiredColumns.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Résultat invalide */}
              {validationResult.status === 'invalid' && (
                <div className="alert alert-warning">
                  <AlertCircle size={18} />
                  <div>
                    <p className="font-semibold">Insight non réalisable</p>
                    <p className="text-sm mt-1">{validationResult.reason}</p>
                  </div>
                </div>
              )}

              {/* Erreur service — style neutre, message générique */}
              {validationResult.status === 'error' && (
                <div className="alert bg-base-200 border border-base-300 text-base-content/70">
                  <WifiOff size={18} className="opacity-50" />
                  <p className="text-sm">{validationResult.error}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                {validationResult.status !== 'valid' && (
                  <button
                    onClick={handleValidateCustomInsight}
                    disabled={!customInsightText.trim() || validationResult.status === 'loading'}
                    className="btn btn-success btn-sm"
                  >
                    {validationResult.status === 'loading' ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Vérification...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Vérifier avec l'IA
                      </>
                    )}
                  </button>
                )}

                {validationResult.status === 'valid' && (
                  <button
                    onClick={handleAddValidatedInsight}
                    disabled={selectedInsights.length >= MAX_INSIGHTS}
                    className="btn btn-success btn-sm"
                  >
                    <Plus size={16} />
                    Ajouter cet insight
                  </button>
                )}
              </div>
=======
              {customValidation && !customValidation.valid && (
                <div className="alert alert-error">
                  <AlertCircle />
                  <span>{customValidation.reason}</span>
                </div>
              )}

              <button
                onClick={handleAddCustomInsight}
                disabled={!customInsightText.trim() || isValidatingCustom}
                className="btn btn-success btn-sm"
              >
                {isValidatingCustom ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Validation...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Valider et ajouter
                  </>
                )}
              </button>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
            </div>
          )}
        </div>
      </div>

      {/* Insights sélectionnés */}
      {selectedInsights.length > 0 && (
        <div className="card bg-success/5 border border-success/30 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold mb-3">Insights sélectionnés ({selectedInsights.length})</h3>
            <div className="space-y-2">
              {selectedInsights.map((insight, idx) => (
                <div
                  key={insight.id}
                  className="flex items-center justify-between p-3 bg-base-100 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="badge badge-success">{idx + 1}</span>
<<<<<<< HEAD
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-xs text-base-content/60">{insight.description}</p>
                    </div>
=======
                    <span className="font-medium">{insight.title}</span>
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                  </div>
                  <button
                    onClick={() => toggleInsight(insight)}
                    className="btn btn-ghost btn-xs btn-square"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};