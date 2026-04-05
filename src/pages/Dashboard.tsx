/**
 * PAGE DASHBOARD
 * Dashboard interactif et intuitif.
 * Export PDF via react-to-print v3.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  BarChart3, Download, ArrowLeft, ChevronDown, ChevronUp,
  FileText, TrendingUp, PieChart, Crosshair, AlertCircle,
  Loader, Cpu, Zap, RefreshCw, Info
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Pie, Scatter as ScatterChart } from 'react-chartjs-2';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ============================================================================
// HELPERS
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAnalysis(id: string) {
  // On s'assure que les headers sont toujours un objet valide
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders() as Record<string, string>
  };

  const res = await fetch(`${BASE_URL}/analysis/${id}`, { 
    headers: headers 
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Session expirée, veuillez vous reconnecter');
    throw new Error('Analyse introuvable');
  }
  
  return res.json();
}

function isAIGenerated(aiInstructions: any): boolean {
  if (!aiInstructions) return false;
  const summary: string = aiInstructions.summary || '';
  return summary.length > 0
    && !summary.includes('indisponible')
    && !summary.includes('Analyse automatique');
}

function formatNumber(val: any): string {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n % 1 === 0 ? n.toLocaleString('fr-FR') : n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

const COLORS = [
  { bg: 'rgba(59,130,246,0.75)', border: 'rgb(59,130,246)' },
  { bg: 'rgba(16,185,129,0.75)', border: 'rgb(16,185,129)' },
  { bg: 'rgba(245,158,11,0.75)', border: 'rgb(245,158,11)' },
  { bg: 'rgba(139,92,246,0.75)', border: 'rgb(139,92,246)' },
  { bg: 'rgba(236,72,153,0.75)', border: 'rgb(236,72,153)' },
  { bg: 'rgba(20,184,166,0.75)', border: 'rgb(20,184,166)' },
  { bg: 'rgba(249,115,22,0.75)', border: 'rgb(249,115,22)' },
  { bg: 'rgba(99,102,241,0.75)', border: 'rgb(99,102,241)' },
];

const baseChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { padding: 12, font: { size: 11 }, boxWidth: 12 }
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      titleFont: { size: 12 }, bodyFont: { size: 11 },
      padding: 10, cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: { size: 10 }, maxRotation: 45 }
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: { font: { size: 10 }, callback: (v: any) => formatNumber(v) }
    },
  },
});

// ============================================================================
// COMPOSANT : CARTE GRAPHIQUE
// ============================================================================

const ChartCard: React.FC<{ chart: any; showExplanations: boolean }> = ({ chart, showExplanations }) => {
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const getIcon = () => {
    switch (chart.type) {
      case 'line': return <TrendingUp size={15} className="text-blue-500" />;
      case 'pie': return <PieChart size={15} className="text-green-500" />;
      case 'scatter': return <Crosshair size={15} className="text-purple-500" />;
      default: return <BarChart3 size={15} className="text-amber-500" />;
    }
  };

  const getSimpleExplanation = () => {
    switch (chart.type) {
      case 'line': return `Ce graphique montre l'évolution de ${chart.y_label || 'la valeur'} dans le temps. Une courbe qui monte = progression, qui descend = baisse.`;
      case 'bar': return `Ce graphique compare ${chart.y_label || 'les valeurs'} entre les catégories. Les barres les plus hautes = valeurs les plus élevées.`;
      case 'pie': return `Répartition en pourcentages. Chaque portion représente la part d'une catégorie dans le total.`;
      case 'scatter': return `Relation entre ${chart.x_label || 'X'} et ${chart.y_label || 'Y'}. Si les points forment une ligne = les deux variables sont liées.`;
      default: return chart.description || '';
    }
  };

  const buildData = () => {
    if (!chart.data) return null;

    if (chart.type === 'scatter') {
      return {
        datasets: (chart.data.datasets || []).map((ds: any, i: number) => ({
          label: ds.label || chart.title,
          data: ds.data || [],
          backgroundColor: COLORS[i % COLORS.length].bg,
          pointRadius: 4, pointHoverRadius: 6,
        }))
      };
    }

    if (chart.type === 'pie') {
      return {
        labels: chart.data.labels || [],
        datasets: [{
          data: chart.data.datasets?.[0]?.data || [],
          backgroundColor: COLORS.map(c => c.bg),
          borderColor: COLORS.map(c => c.border),
          borderWidth: 1, hoverOffset: 8,
        }]
      };
    }

    return {
      labels: chart.data.labels || [],
      datasets: (chart.data.datasets || []).map((ds: any, i: number) => ({
        label: ds.label || chart.y_label || 'Valeur',
        data: ds.data || [],
        backgroundColor: chart.type === 'line'
          ? COLORS[i % COLORS.length].bg.replace('0.75', '0.12')
          : COLORS[i % COLORS.length].bg,
        borderColor: COLORS[i % COLORS.length].border,
        borderWidth: chart.type === 'line' ? 2 : 1,
        fill: chart.type === 'line',
        tension: 0.4,
        pointRadius: chart.type === 'line' ? 3 : 0,
        pointHoverRadius: chart.type === 'line' ? 5 : 0,
        borderRadius: chart.type === 'bar' ? 4 : 0,
      }))
    };
  };

  const chartData = buildData();
  if (!chartData) return null;

  const opts = baseChartOptions();
  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { position: 'right' as const, labels: { padding: 12, font: { size: 11 }, boxWidth: 12 } },
      tooltip: opts.plugins.tooltip,
    },
  };
  const scatterOpts = {
    ...opts,
    plugins: {
      ...opts.plugins,
      tooltip: { ...opts.plugins.tooltip, mode: 'point' as const, intersect: true }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* En-tête */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-sm flex-1 text-gray-800">{chart.title}</h3>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Comprendre ce graphique"
          >
            <Info size={13} />
          </button>
        </div>
        {chart.x_label && chart.y_label && (
          <p className="text-xs text-gray-400 mt-1">{chart.x_label} → {chart.y_label}</p>
        )}
        {showInfo && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-gray-600 leading-relaxed">
            {getSimpleExplanation()}
          </div>
        )}
      </div>

      {/* Graphique */}
      <div className="px-4 py-4" style={{ height: '260px' }}>
        {chart.type === 'bar' && <Bar data={chartData} options={opts as any} />}
        {chart.type === 'line' && <Line data={chartData} options={opts as any} />}
        {chart.type === 'pie' && <Pie data={chartData} options={pieOpts as any} />}
        {chart.type === 'scatter' && <ScatterChart data={chartData} options={scatterOpts as any} />}
      </div>

      {/* Explication IA déroulante */}
      {showExplanations && chart.description && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <FileText size={12} />Analyse détaillée
            </span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100">
              {chart.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT CONTENU IMPRIMABLE
// ============================================================================

const PrintableReport = React.forwardRef<HTMLDivElement, { analysis: any; fromAI: boolean }>(
  ({ analysis, fromAI }, ref) => {
    const metadata = analysis.metadata || {};
    const stats = metadata.statistics || {};
    const charts = analysis.charts || [];
    const summary = analysis.ai_instructions?.summary || '';
    const fileName = analysis.file_name?.replace(/\.[^/.]+$/, '') || 'Analyse';

    const numericCols: string[] = (metadata.numeric_columns || [])
      .filter((col: string) => !['id', 'index'].some((x: string) => col.toLowerCase().includes(x)))
      .slice(0, 4);

    return (
      <div ref={ref} style={{ background: '#f3f4f6', padding: '24px', minHeight: '100vh' }}>

        {/* En-tête */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{fileName}</h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                {(metadata.row_count || 0).toLocaleString('fr-FR')} lignes · {metadata.column_count || 0} colonnes ·{' '}
                {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span style={{
              fontSize: '12px', fontWeight: '500', padding: '4px 12px', borderRadius: '999px',
              background: fromAI ? '#f0fdf4' : '#f9fafb',
              color: fromAI ? '#16a34a' : '#6b7280',
              border: `1px solid ${fromAI ? '#bbf7d0' : '#e5e7eb'}`
            }}>
              {fromAI ? '⚡ Analysé par l\'IA' : '🖥 Analyse automatique'}
            </span>
          </div>
        </div>

        {/* Métriques */}
        {numericCols.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Indicateurs clés
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numericCols.length, 4)}, 1fr)`, gap: '12px' }}>
              {numericCols.map((col: string) => {
                const s = stats[col] || {};
                return (
                  <div key={col} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px' }}>
                    <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '500' }}>{col}</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Moyenne</p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{formatNumber(s.mean)}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '6px 8px' }}>
                        <p style={{ fontSize: '10px', color: '#9ca3af' }}>Min</p>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{formatNumber(s.min)}</p>
                      </div>
                      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '6px 8px' }}>
                        <p style={{ fontSize: '10px', color: '#9ca3af' }}>Max</p>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{formatNumber(s.max)}</p>
                      </div>
                    </div>
                    {s.sum != null && Math.abs(s.sum) > Math.abs(s.mean || 0) * 10 && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                        <p style={{ fontSize: '10px', color: '#9ca3af' }}>Total</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>{formatNumber(s.sum)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rapport IA */}
        {fromAI && summary && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Rapport d'analyse</span>
              <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '999px', fontWeight: '500' }}>IA</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>{summary}</p>
            {(analysis.explanations || []).length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {analysis.explanations.map((exp: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', marginTop: '7px', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{exp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message fallback */}
        {!fromAI && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>🖥 Analyse automatique — graphiques générés à partir de vos données.</p>
          </div>
        )}

        {/* Graphiques */}
        {charts.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Visualisations ({charts.length})
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {charts.map((chart: any, idx: number) => (
                <ChartCard key={idx} chart={chart} showExplanations={fromAI} />
              ))}
            </div>
          </div>
        )}

        {/* Insights IA */}
        {fromAI && (analysis.insights || []).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Statistiques détaillées
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {analysis.insights.map((insight: any, idx: number) => (
                <div key={idx} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '4px' }}>{insight.title}</p>
                  <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>{insight.value}</p>
                  {insight.data && insight.type === 'groupby' && (
                    <div style={{ marginTop: '8px' }}>
                      {Object.entries(insight.data).slice(0, 5).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{k}</span>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#374151' }}>{formatNumber(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#d1d5db' }}>
            <span>AutoBI · {analysis.file_name}</span>
            <span>Analyse #{analysis.analysis_id} · {analysis.tokens_consumed || 0} jeton{(analysis.tokens_consumed || 0) > 1 ? 's' : ''}</span>
          </div>
        </div>

      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const Dashboard: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);

  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromAI = analysis ? isAIGenerated(analysis.ai_instructions) : false;

  useEffect(() => {
    if (analysisId) loadAnalysis();
    refreshUser();
  }, [analysisId]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAnalysis(analysisId!);
      setAnalysis(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // react-to-print v3 — utilise contentRef
  const handleExportPDF = useReactToPrint({
    contentRef: reportRef,
    documentTitle: analysis?.file_name?.replace(/\.[^/.]+$/, '') || 'rapport',
    pageStyle: `
      @page { size: A4; margin: 8mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  // ---- ÉTATS ----
  if (isLoading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4 text-green-500" size={40} />
        <p className="text-gray-500">Chargement du dashboard...</p>
      </div>
    </div>
  );

  if (error || !analysis) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm max-w-md w-full p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
        <h3 className="font-semibold mb-2 text-gray-800">Analyse introuvable</h3>
        <p className="text-gray-500 mb-4 text-sm">{error}</p>
        <button onClick={() => navigate('/history')} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Retour à l'historique
        </button>
      </div>
    </div>
  );

  const metadata = analysis.metadata || {};
  const fileName = analysis.file_name?.replace(/\.[^/.]+$/, '') || 'Analyse';

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ---- BARRE DE NAVIGATION ---- */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/history')} className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft size={16} /> Historique
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{fileName}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-400">
                  {(metadata.row_count || 0).toLocaleString('fr-FR')} lignes · {metadata.column_count || 0} colonnes
                </span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  fromAI
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {fromAI ? <><Zap size={10} />Analysé par l'IA</> : <><Cpu size={10} />Analyse automatique</>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { loadAnalysis(); refreshUser(); }}
              className="btn btn-ghost btn-sm"
              title="Rafraîchir"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={handleExportPDF}
              className="btn btn-outline btn-sm gap-2"
            >
              <Download size={15} />Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      {/* ---- CONTENU AFFICHÉ + IMPRIMABLE ---- */}
      <PrintableReport ref={reportRef} analysis={analysis} fromAI={fromAI} />

    </div>
  );
};