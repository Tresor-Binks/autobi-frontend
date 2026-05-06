/**
 * DASHBOARD — AutoBI
 * Lit le JSON produit par OpenAI : summary, kpis[], charts[], insights[]
 * Affiche graphiques Chart.js + KPIs + résumé + export PDF
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  BarChart3, Download, ArrowLeft, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, PieChart, Crosshair, AlertCircle,
  Loader, Zap, RefreshCw, Target, Clock, Package, Users,
  Minus, Star, Euro, Percent
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Scatter as ScatterChart } from 'react-chartjs-2';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ============================================================================
// TYPES
// ============================================================================

interface KPI {
  id: string;
  label: string;
  value: string;
  raw_value?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable' | null;
  trend_value?: string | null;
  description?: string;
  icon?: string;
}

interface ChartDataset {
  label: string;
  data: any[];
}

interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

interface ChartItem {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  title: string;
  description?: string;
  insight?: string;
  data: ChartData;
  options?: {
    x_label?: string;
    y_label?: string;
    stacked?: boolean;
    show_legend?: boolean;
  };
}

interface InsightItem {
  id: string;
  title: string;
  description?: string;
  value?: string;
  type?: string;
  interpretation?: string;
  data?: any;
}

interface ReportSummary {
  title?: string;
  description?: string;
  key_takeaways?: string[];
}

// ============================================================================
// HELPERS
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAnalysis(id: string) {
  const res = await fetch(`${BASE_URL}/analysis/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Session expirée');
    throw new Error('Analyse introuvable');
  }
  return res.json();
}

function formatNumber(val: any): string {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n % 1 === 0 ? n.toLocaleString('fr-FR') : n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

// Palette Chart.js — cohérente et lisible
const PALETTE = [
  { bg: 'rgba(16,185,129,0.8)',  border: 'rgb(16,185,129)'  }, // vert
  { bg: 'rgba(59,130,246,0.8)',  border: 'rgb(59,130,246)'  }, // bleu
  { bg: 'rgba(245,158,11,0.8)',  border: 'rgb(245,158,11)'  }, // amber
  { bg: 'rgba(139,92,246,0.8)',  border: 'rgb(139,92,246)'  }, // violet
  { bg: 'rgba(236,72,153,0.8)',  border: 'rgb(236,72,153)'  }, // rose
  { bg: 'rgba(20,184,166,0.8)',  border: 'rgb(20,184,166)'  }, // teal
  { bg: 'rgba(249,115,22,0.8)',  border: 'rgb(249,115,22)'  }, // orange
  { bg: 'rgba(99,102,241,0.8)',  border: 'rgb(99,102,241)'  }, // indigo
  { bg: 'rgba(34,197,94,0.8)',   border: 'rgb(34,197,94)'   }, // green
  { bg: 'rgba(239,68,68,0.8)',   border: 'rgb(239,68,68)'   }, // red
];

function buildChartJsData(chart: ChartItem) {
  const { type, data } = chart;

  if (!data || !data.datasets?.length) return null;

  if (type === 'scatter') {
    return {
      datasets: data.datasets.map((ds, i) => ({
        label: ds.label || chart.title,
        data: ds.data || [],
        backgroundColor: PALETTE[i % PALETTE.length].bg,
        pointRadius: 5,
        pointHoverRadius: 7,
      })),
    };
  }

  if (type === 'pie' || type === 'doughnut') {
    return {
      labels: data.labels || [],
      datasets: [{
        data: data.datasets[0]?.data || [],
        backgroundColor: PALETTE.map(c => c.bg),
        borderColor: PALETTE.map(c => c.border),
        borderWidth: 2,
        hoverOffset: 10,
      }],
    };
  }

  // bar / line
  return {
    labels: data.labels || [],
    datasets: data.datasets.map((ds, i) => ({
      label: ds.label || `Série ${i + 1}`,
      data: ds.data || [],
      backgroundColor: type === 'line'
        ? PALETTE[i % PALETTE.length].bg.replace('0.8', '0.15')
        : PALETTE[i % PALETTE.length].bg,
      borderColor: PALETTE[i % PALETTE.length].border,
      borderWidth: type === 'line' ? 2.5 : 1,
      fill: type === 'line',
      tension: 0.4,
      pointRadius: type === 'line' ? 3 : 0,
      pointHoverRadius: type === 'line' ? 6 : 0,
      borderRadius: type === 'bar' ? 6 : 0,
    })),
  };
}

function buildChartOptions(chart: ChartItem) {
  const opts = chart.options || {};
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: {
        display: opts.show_legend !== false,
        position: 'bottom' as const,
        labels: { padding: 14, font: { size: 11 }, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed?.y ?? ctx.parsed;
            return ` ${ctx.dataset.label}: ${formatNumber(typeof val === 'object' ? val?.y : val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: opts.stacked || false,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          maxTicksLimit: 15,
        },
        title: opts.x_label
          ? { display: true, text: opts.x_label, font: { size: 11 }, color: '#9ca3af' }
          : undefined,
      },
      y: {
        stacked: opts.stacked || false,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          font: { size: 10 },
          callback: (v: any) => formatNumber(v),
        },
        title: opts.y_label
          ? { display: true, text: opts.y_label, font: { size: 11 }, color: '#9ca3af' }
          : undefined,
      },
    },
  };
  return base;
}

// ============================================================================
// KPI ICON
// ============================================================================
function KpiIcon({ icon }: { icon?: string }) {
  const cls = "text-emerald-600" ;
  const sz = 20;
  switch (icon) {
    case 'euro':        return <Euro size={sz} className={cls} />;
    case 'percent':     return <Percent size={sz} className={cls} />;
    case 'users':       return <Users size={sz} className={cls} />;
    case 'trending-up': return <TrendingUp size={sz} className={cls} />;
    case 'trending-down': return <TrendingDown size={sz} className="text-red-500" />;
    case 'target':      return <Target size={sz} className={cls} />;
    case 'clock':       return <Clock size={sz} className={cls} />;
    case 'package':     return <Package size={sz} className={cls} />;
    case 'star':        return <Star size={sz} className={cls} />;
    default:            return <BarChart3 size={sz} className={cls} />;
  }
}

// ============================================================================
// CARTE KPI
// ============================================================================
const KpiCard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  const trendUp   = kpi.trend === 'up';
  const trendDown = kpi.trend === 'down';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-emerald-50 rounded-lg">
          <KpiIcon icon={kpi.icon} />
        </div>
        {kpi.trend && kpi.trend !== 'stable' && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendUp   ? 'bg-emerald-50 text-emerald-600' :
            trendDown ? 'bg-red-50 text-red-500' :
            'bg-gray-100 text-gray-500'
          }`}>
            {trendUp ? <TrendingUp size={11} /> : trendDown ? <TrendingDown size={11} /> : <Minus size={11} />}
            {kpi.trend_value || kpi.trend}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{kpi.label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">
        {kpi.value}
        {kpi.unit && !String(kpi.value).toLowerCase().includes(String(kpi.unit).toLowerCase()) && (
          <span className="text-sm font-normal text-gray-400 ml-1">{kpi.unit}</span>
        )}
      </p>
      {kpi.description && (
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{kpi.description}</p>
      )}
    </div>
  );
};

// ============================================================================
// CARTE GRAPHIQUE
// ============================================================================
const ChartCard: React.FC<{ chart: ChartItem }> = ({ chart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const chartData = buildChartJsData(chart);
  const chartOpts = buildChartOptions(chart);

  if (!chartData) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-center h-80">
        <p className="text-gray-400 text-sm">Données insuffisantes pour ce graphique</p>
      </div>
    );
  }

  const getTypeIcon = () => {
    switch (chart.type) {
      case 'line':     return <TrendingUp size={14} className="text-blue-500" />;
      case 'pie':
      case 'doughnut': return <PieChart size={14} className="text-violet-500" />;
      case 'scatter':  return <Crosshair size={14} className="text-purple-500" />;
      default:         return <BarChart3 size={14} className="text-amber-500" />;
    }
  };

  const pieDoughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { padding: 14, font: { size: 11 }, boxWidth: 12 },
      },
      tooltip: chartOpts.plugins.tooltip,
    },
  };

  const scatterOpts = {
    ...chartOpts,
    plugins: {
      ...chartOpts.plugins,
      tooltip: { ...chartOpts.plugins.tooltip, mode: 'point' as const, intersect: true },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* En-tête */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          {getTypeIcon()}
          <h3 className="font-semibold text-sm text-gray-800 flex-1">{chart.title}</h3>
          <span className="text-xs text-gray-300 uppercase tracking-widest">{chart.type}</span>
        </div>
        {chart.insight && (
          <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full inline-block mt-1">
            ✦ {chart.insight}
          </p>
        )}
      </div>

      {/* Graphique */}
      <div className="px-4 pb-2" style={{ height: 280 }}>
        {chart.type === 'bar'      && <Bar      data={chartData} options={chartOpts as any} />}
        {chart.type === 'line'     && <Line     data={chartData} options={chartOpts as any} />}
        {chart.type === 'pie'      && <Pie      data={chartData} options={pieDoughnutOpts as any} />}
        {chart.type === 'doughnut' && <Doughnut data={chartData} options={pieDoughnutOpts as any} />}
        {chart.type === 'scatter'  && <ScatterChart data={chartData} options={scatterOpts as any} />}
      </div>

      {/* Analyse déroulante */}
      {chart.description && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Zap size={11} className="text-emerald-500" />
              Analyse détaillée
            </span>
            {showDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showDetail && (
            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
              {chart.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CARTE INSIGHT
// ============================================================================
const InsightCard: React.FC<{ insight: InsightItem; index: number }> = ({ insight, index }) => {
  const colors = [
    'border-l-emerald-400 bg-emerald-50/40',
    'border-l-blue-400 bg-blue-50/40',
    'border-l-amber-400 bg-amber-50/40',
    'border-l-violet-400 bg-violet-50/40',
    'border-l-rose-400 bg-rose-50/40',
    'border-l-teal-400 bg-teal-50/40',
  ];
  const dotColors = ['bg-emerald-400','bg-blue-400','bg-amber-400','bg-violet-400','bg-rose-400','bg-teal-400'];
  const colorClass = colors[index % colors.length];
  const dotColor = dotColors[index % dotColors.length];

  return (
    <div className={`border-l-4 rounded-r-xl p-4 ${colorClass}`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
        <h4 className="font-semibold text-sm text-gray-800">{insight.title}</h4>
      </div>
      {insight.value && (
        <p className="text-base font-bold text-gray-900 ml-4 mb-1">{insight.value}</p>
      )}
      {insight.description && (
        <p className="text-xs text-gray-500 ml-4 leading-relaxed">{insight.description}</p>
      )}
      {insight.interpretation && (
        <div className="mt-2 ml-4 pt-2 border-t border-white/60">
          <p className="text-xs text-gray-400 italic">→ {insight.interpretation}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONTENU IMPRIMABLE
// ============================================================================
const PrintableReport = React.forwardRef<HTMLDivElement, { analysis: any }>(({ analysis }, ref) => {
  const results     = analysis || {};
  const summaryObj: ReportSummary = results.summary || {};
  const kpis: KPI[] = results.kpis || [];
  const charts: ChartItem[] = results.charts || [];
  const insights: InsightItem[] = results.insights || [];
  const metadata    = results.metadata || {};
  const fileName    = analysis.file_name?.replace(/\.[^/.]+$/, '') || 'Analyse';

  return (
    <div ref={ref} className="bg-gray-50 min-h-screen p-6 space-y-5">

      {/* ── EN-TÊTE ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {summaryObj.title || fileName}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {(metadata.row_count || 0).toLocaleString('fr-FR')} lignes ·{' '}
              {metadata.column_count || 0} colonnes ·{' '}
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Zap size={11} /> Analysé par l'IA
          </span>
        </div>

        {/* Résumé */}
        {summaryObj.description && (
          <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">
            {summaryObj.description}
          </p>
        )}

        {/* Key takeaways */}
        {summaryObj.key_takeaways && summaryObj.key_takeaways.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {summaryObj.key_takeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold text-xs mt-0.5">✦</span>
                <p className="text-sm text-gray-600">{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── KPIs ── */}
      {kpis.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Indicateurs clés
          </p>
          <div className={`grid gap-4 ${
            kpis.length === 1 ? 'grid-cols-1' :
            kpis.length === 2 ? 'grid-cols-2' :
            kpis.length === 3 ? 'grid-cols-3' :
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {kpis.map(kpi => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>
        </div>
      )}

      {/* ── GRAPHIQUES ── */}
      {charts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Visualisations ({charts.length})
          </p>
          <div className={`grid gap-5 ${charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {charts.map(chart => <ChartCard key={chart.id} chart={chart} />)}
          </div>
        </div>
      )}

      {/* ── INSIGHTS ── */}
      {insights.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Insights détaillés
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, i) => <InsightCard key={ins.id || i} insight={ins} index={i} />)}
          </div>
        </div>
      )}

      {/* ── PIED DE PAGE ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex justify-between text-xs text-gray-300">
        <span>AutoBI · {analysis.file_name}</span>
        <span>Analyse #{analysis.analysis_id} · {analysis.tokens_consumed || 0} jeton(s)</span>
      </div>

    </div>
  );
});
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
  const [error, setError]   = useState<string | null>(null);

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

  const handleExportPDF = useReactToPrint({
    contentRef: reportRef,
    documentTitle: analysis?.file_name?.replace(/\.[^/.]+$/, '') || 'rapport',
    pageStyle: `
      @page { size: A4; margin: 8mm; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `,
  });

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4 text-emerald-500" size={40} />
        <p className="text-gray-400 text-sm">Chargement du dashboard...</p>
      </div>
    </div>
  );

  // ── ERREUR ─────────────────────────────────────────────────────────────────
  if (error || !analysis) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm max-w-md w-full p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
        <h3 className="font-semibold mb-2 text-gray-800">Analyse introuvable</h3>
        <p className="text-gray-400 mb-4 text-sm">{error}</p>
        <button onClick={() => navigate('/history')} className="btn btn-outline btn-sm gap-2">
          <ArrowLeft size={16} /> Historique
        </button>
      </div>
    </div>
  );

  const metadata = analysis.metadata || {};
  const summaryObj: ReportSummary = analysis.summary || {};
  const kpis: KPI[] = analysis.kpis || [];
  const charts: ChartItem[] = analysis.charts || [];
  const insights: InsightItem[] = analysis.insights || [];
  const fileName = analysis.file_name?.replace(/\.[^/.]+$/, '') || 'Analyse';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/history')} className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft size={16} /> Historique
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                {summaryObj.title || fileName}
              </h1>
              <p className="text-xs text-gray-400">
                {(metadata.row_count || 0).toLocaleString('fr-FR')} lignes ·{' '}
                {metadata.column_count || 0} colonnes
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Zap size={10} /> IA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadAnalysis(); refreshUser(); }} className="btn btn-ghost btn-sm" title="Rafraîchir">
              <RefreshCw size={15} />
            </button>
            <button onClick={handleExportPDF} className="btn btn-outline btn-sm gap-2">
              <Download size={15} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── RAPPORT ── */}
      <PrintableReport ref={reportRef} analysis={analysis} />

    </div>
  );
};