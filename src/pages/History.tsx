/**
 * PAGE HISTORY
 * Affiche l'historique de toutes les analyses.
 * Demande la connexion si non authentifié.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon, FileSpreadsheet, BarChart3,
  Clock, CheckCircle2, AlertCircle, Loader, LogIn
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLayoutContext } from '../layouts/MainLayout';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.autobi.app';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface AnalysisItem {
  id: number;
  file_name: string;
  status: string;
  tokens_consumed: number;
  created_at: string | null;
}

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { onRequestAuth } = useLayoutContext();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadHistory();
    else setIsLoading(false);
  }, [isAuthenticated]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/analysis/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setAnalyses(data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return (
      <div className="flex items-center gap-1.5 text-success text-sm font-medium">
        <CheckCircle2 size={14} />Terminée
      </div>
    );
    if (s === 'processing' || s === 'pending') return (
      <div className="flex items-center gap-1.5 text-warning text-sm font-medium">
        <Loader size={14} className="animate-spin" />En cours
      </div>
    );
    if (s === 'failed') return (
      <div className="flex items-center gap-1.5 text-error text-sm font-medium">
        <AlertCircle size={14} />Échouée
      </div>
    );
    return <span className="badge badge-ghost badge-sm">{status}</span>;
  };

  // ---- NON CONNECTÉ ----
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Titre */}
        <div className="flex items-center gap-3 mb-6 min-w-0">
          <HistoryIcon className="text-base-content/60" size={22} />
          <h1 className="text-lg sm:text-xl font-bold leading-tight">Historique des analyses</h1>
        </div>

        {/* Zone avec historique fictif flouté + overlay */}
        <div className="relative min-h-64">
          {/* Historique fictif visible en arrière-plan */}
          <div className="space-y-3 blur-sm opacity-50 pointer-events-none select-none">
            {[
              { name: 'ventes_2024.xlsx', date: '15 janvier 2025', tokens: 3 },
              { name: 'rapport_mensuel.xlsx', date: '8 janvier 2025', tokens: 2 },
              { name: 'budget_q1.xlsx', date: '2 janvier 2025', tokens: 1 },
            ].map((item, i) => (
              <div key={i} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body py-4 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <FileSpreadsheet className="text-success" size={22} />
                      <div>
                        <p className="font-semibold break-all">{item.name}</p>
                        <p className="text-xs text-base-content/50 mt-0.5">{item.date} · {item.tokens} jeton{item.tokens > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                        <CheckCircle2 size={14} />Terminée
                      </div>
                      <div className="btn btn-sm btn-success gap-2 opacity-50 min-h-10">
                        <BarChart3 size={14} />Voir le rapport
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overlay connexion par-dessus */}
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-base-100 border border-base-300 rounded-2xl shadow-lg p-5 sm:p-8 text-center max-w-sm w-full mx-2 sm:mx-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-success/10 rounded-full mb-4">
                <LogIn className="text-success" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Connexion requise</h3>
              <p className="text-base-content/60 text-sm mb-5">
                Connectez-vous pour accéder à l'historique de vos analyses.
              </p>
              <button onClick={onRequestAuth} className="btn btn-success w-full">
                <LogIn size={18} />Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return (
    <div className="p-4 sm:p-8 flex justify-center items-center">
      <span className="loading loading-spinner loading-lg text-success"></span>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6 min-w-0">
        <HistoryIcon className="text-base-content/60" size={22} />
        <h1 className="text-lg sm:text-xl font-bold leading-tight">Historique des analyses</h1>
        {analyses.length > 0 && (
          <span className="badge badge-neutral badge-sm">{analyses.length}</span>
        )}
      </div>

      {analyses.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center py-10 sm:py-16 px-4 sm:px-6">
            <HistoryIcon className="mx-auto mb-4 text-base-content/30" size={48} />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Aucune analyse pour le moment</h3>
            <p className="text-sm sm:text-base text-base-content/50 mb-6">Vos analyses apparaîtront ici après votre première analyse</p>
            <button onClick={() => navigate('/analysis')} className="btn btn-success btn-sm mx-auto">
              <BarChart3 size={16} />Lancer une analyse
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body py-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <FileSpreadsheet className="text-success flex-shrink-0" size={22} />
                    <div>
                      <h3 className="font-semibold break-all">{analysis.file_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 min-w-0">
                        {analysis.created_at && (
                          <p className="text-xs text-base-content/50 flex items-center gap-1 min-w-0 flex-wrap">
                            <Clock size={11} />
                            {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'long', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                        {analysis.tokens_consumed > 0 && (
                          <p className="text-xs text-base-content/40">
                            {analysis.tokens_consumed} jeton{analysis.tokens_consumed > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {getStatusBadge(analysis.status)}
                    {analysis.status.toLowerCase() === 'completed' && (
                      <button onClick={() => navigate(`/dashboard/${analysis.id}`)} className="btn btn-sm btn-success gap-2 min-h-10">
                        <BarChart3 size={14} />Voir le rapport
                      </button>
                    )}
                    {(analysis.status.toLowerCase() === 'processing' || analysis.status.toLowerCase() === 'pending') && (
                      <button className="btn btn-sm btn-ghost btn-disabled min-h-10" disabled>En cours...</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};