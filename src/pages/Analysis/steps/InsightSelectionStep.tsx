/**
 * ÉTAPES 3 & 4 : PROPOSITION ET SÉLECTION D'INSIGHTS
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
} from '../api/analysisApi';

interface InsightSelectionStepProps {
  columns: Column[];
  onInsightsSelected: (insights: SuggestedInsight[]) => void;
}

const MAX_INSIGHTS = 6;

export const InsightSelectionStep: React.FC<InsightSelectionStepProps> = ({ 
  columns, 
  onInsightsSelected 
}) => {
  const [suggestedInsights, setSuggestedInsights] = useState<SuggestedInsight[]>([]);
  const [selectedInsights, setSelectedInsights] = useState<SuggestedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInsightText, setCustomInsightText] = useState('');
  const [isValidatingCustom, setIsValidatingCustom] = useState(false);
  const [customValidation, setCustomValidation] = useState<InsightValidationResponse | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [columns]);

  useEffect(() => {
    onInsightsSelected(selectedInsights);
  }, [selectedInsights]);

  /**
   * Chargement des suggestions d'insights
   */
  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const insights = await analysisApi.suggestInsights(columns);
      setSuggestedInsights(insights);
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      setSelectedInsights(prev => [...prev, insight]);
    }
  };

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
  const getInsightIcon = (type: SuggestedInsight['type']) => {
    const icons = {
      trend: TrendingUp,
      comparison: BarChart3,
      total: BarChart3,
      anomaly: AlertCircle,
      distribution: BarChart3
    };

    const Icon = icons[type] || BarChart3;
    return <Icon size={20} className="text-success" />;
  };

  /**
   * Badge de faisabilité
   */
  const getFeasibilityBadge = (feasibility: 'high' | 'medium' | 'low') => {
    const config = {
      high: { label: 'Facile', class: 'badge-success' },
      medium: { label: 'Moyen', class: 'badge-warning' },
      low: { label: 'Difficile', class: 'badge-error' }
    };

    const { label, class: badgeClass } = config[feasibility];
    return <span className={`badge badge-sm ${badgeClass}`}>{label}</span>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto mb-4 text-success" size={48} />
        <h3 className="text-lg font-semibold mb-2">L'IA analyse vos données...</h3>
        <p className="text-base-content/60">
          Génération d'insights pertinents basés sur votre fichier
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Sélectionnez vos insights</h2>
          <p className="text-base-content/70">
            Choisissez jusqu'à {MAX_INSIGHTS} insights à générer pour votre dashboard
          </p>
        </div>

        {/* Compteur */}
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

      {/* Message si limite atteinte */}
      {selectedInsights.length >= MAX_INSIGHTS && (
        <div className="alert alert-warning">
          <AlertCircle />
          <span>
            Vous avez atteint la limite de {MAX_INSIGHTS} insights. 
            Désélectionnez-en pour en choisir d'autres.
          </span>
        </div>
      )}

      {/* Insights suggérés */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-success" size={24} />
          <h3 className="text-xl font-semibold">Suggestions de l'IA</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedInsights.map((insight) => {
            const isSelected = selectedInsights.some(i => i.id === insight.id);

            return (
              <div
                key={insight.id}
                onClick={() => toggleInsight(insight)}
                className={`card cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-success bg-success/5'
                    : 'border-base-300 hover:border-success/50'
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

                    {isSelected && (
                      <div className="bg-success text-success-content rounded-full p-1">
                        <Check size={16} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {getFeasibilityBadge(insight.feasibility)}
                    {insight.requiredColumns.length > 0 && (
                      <span className="text-xs text-base-content/50">
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
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="btn btn-sm btn-outline btn-success"
              disabled={selectedInsights.length >= MAX_INSIGHTS}
            >
              {showCustomForm ? <X size={16} /> : <Plus size={16} />}
              {showCustomForm ? 'Annuler' : 'Ajouter'}
            </button>
          </div>

          {showCustomForm && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
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
                  </span>
                </label>
              </div>

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
                    <span className="font-medium">{insight.title}</span>
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