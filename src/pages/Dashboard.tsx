/**
 * DASHBOARD — AutoBI
 * Export PDF : jsPDF programmatique (zéro capture DOM, zéro erreur oklch)
 * Export PPTX : PptxGenJS (génération côté frontend, téléchargement direct)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3, Download, ArrowLeft, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, PieChart, Crosshair, AlertCircle,
  Loader, Zap, RefreshCw, Target, Clock, Package, Users,
  Minus, Star, Euro, Percent, Printer
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
  id: string; label: string; value: string; raw_value?: number;
  unit?: string; trend?: 'up' | 'down' | 'stable' | null;
  trend_value?: string | null; description?: string; icon?: string;
}
interface ChartDataset { label: string; data: any[]; }
interface ChartData { labels?: string[]; datasets: ChartDataset[]; }
interface ChartItem {
  id: string; type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  title: string; description?: string; insight?: string; data: ChartData;
  options?: { x_label?: string; y_label?: string; stacked?: boolean; show_legend?: boolean; };
}
interface InsightItem {
  id: string; title: string; description?: string;
  value?: string; type?: string; interpretation?: string; data?: any;
}
interface ReportSummary { title?: string; description?: string; key_takeaways?: string[]; }

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
  if (!res.ok) { if (res.status === 401) throw new Error('Session expirée'); throw new Error('Analyse introuvable'); }
  return res.json();
}
function formatNumber(val: any): string {
  if (val === null || val === undefined) return '—';
  const n = Number(val); if (isNaN(n)) return String(val);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n % 1 === 0 ? n.toLocaleString('fr-FR') : n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

const PALETTE = [
  { bg: 'rgba(16,185,129,0.8)',  border: 'rgb(16,185,129)'  },
  { bg: 'rgba(59,130,246,0.8)',  border: 'rgb(59,130,246)'  },
  { bg: 'rgba(245,158,11,0.8)',  border: 'rgb(245,158,11)'  },
  { bg: 'rgba(139,92,246,0.8)',  border: 'rgb(139,92,246)'  },
  { bg: 'rgba(236,72,153,0.8)',  border: 'rgb(236,72,153)'  },
  { bg: 'rgba(20,184,166,0.8)',  border: 'rgb(20,184,166)'  },
  { bg: 'rgba(249,115,22,0.8)',  border: 'rgb(249,115,22)'  },
  { bg: 'rgba(99,102,241,0.8)',  border: 'rgb(99,102,241)'  },
  { bg: 'rgba(34,197,94,0.8)',   border: 'rgb(34,197,94)'   },
  { bg: 'rgba(239,68,68,0.8)',   border: 'rgb(239,68,68)'   },
];
const PPTX_COLORS = ['10B981','3B82F6','F59E0B','8B5CF6','EC4899','14B8A6','F97316','6366F1','22C55E','EF4444'];

function buildChartJsData(chart: ChartItem) {
  const { type, data } = chart;
  if (!data || !data.datasets?.length) return null;
  if (type === 'scatter') {
    return { datasets: data.datasets.map((ds, i) => ({ label: ds.label || chart.title, data: ds.data || [], backgroundColor: PALETTE[i % PALETTE.length].bg, pointRadius: 5, pointHoverRadius: 7 })) };
  }
  if (type === 'pie' || type === 'doughnut') {
    return { labels: data.labels || [], datasets: [{ data: data.datasets[0]?.data || [], backgroundColor: PALETTE.map(c => c.bg), borderColor: PALETTE.map(c => c.border), borderWidth: 2, hoverOffset: 10 }] };
  }
  return {
    labels: data.labels || [],
    datasets: data.datasets.map((ds, i) => ({
      label: ds.label || `Série ${i + 1}`, data: ds.data || [],
      backgroundColor: type === 'line' ? PALETTE[i % PALETTE.length].bg.replace('0.8', '0.15') : PALETTE[i % PALETTE.length].bg,
      borderColor: PALETTE[i % PALETTE.length].border,
      borderWidth: type === 'line' ? 2.5 : 1, fill: type === 'line', tension: 0.4,
      pointRadius: type === 'line' ? 3 : 0, pointHoverRadius: type === 'line' ? 6 : 0, borderRadius: type === 'bar' ? 6 : 0,
    })),
  };
}

function buildChartOptions(chart: ChartItem) {
  const opts = chart.options || {};
  return {
    responsive: true, maintainAspectRatio: false, animation: { duration: 700 },
    plugins: {
      legend: { display: opts.show_legend !== false, position: 'bottom' as const, labels: { padding: 14, font: { size: 11 }, boxWidth: 12 } },
      tooltip: { backgroundColor: 'rgba(15,23,42,0.92)', titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 6,
        callbacks: { label: (ctx: any) => { const val = ctx.parsed?.y ?? ctx.parsed; return ` ${ctx.dataset.label}: ${formatNumber(typeof val === 'object' ? val?.y : val)}`; } } },
    },
    scales: {
      x: { stacked: opts.stacked || false, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, maxRotation: 45, maxTicksLimit: 15 }, title: opts.x_label ? { display: true, text: opts.x_label, font: { size: 11 }, color: '#9ca3af' } : undefined },
      y: { stacked: opts.stacked || false, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 10 }, callback: (v: any) => formatNumber(v) }, title: opts.y_label ? { display: true, text: opts.y_label, font: { size: 11 }, color: '#9ca3af' } : undefined },
    },
  };
}

// ============================================================================
// EXPORT PDF — jsPDF programmatique 100% (zéro html2canvas, zéro erreur oklch)

async function exportToPPTX(analysis: any, fileName: string) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();

  const summary  = analysis.summary  || {};
  const kpis: any[]    = analysis.kpis    || [];
  const charts: any[]  = analysis.charts  || [];
  const insights: any[]= analysis.insights|| [];
  const metadata = analysis.metadata || {};

  const C = {
    green:'059669', greenM:'10B981', greenL:'ECFDF5', greenD:'064E3B',
    dark: '0F172A', slate: '1E293B', gray: '64748B', light:'F8FAFC',
    border:'E2E8F0', white:'FFFFFF', accent:'34D399',
    chart:['059669','3B82F6','F59E0B','8B5CF6','EC4899',
           '14B8A6','F97316','6366F1','22C55E','EF4444'],
  };
  pptx.layout = 'LAYOUT_WIDE';

  const hdr = (sl:any, title:string, sub='') => {
    sl.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:1.1,fill:{color:C.dark}});
    sl.addText(title,{x:0.55,y:0.15,w:10,h:0.6,fontSize:22,bold:true,color:C.white,fontFace:'Calibri'});
    if(sub) sl.addText(sub,{x:0.55,y:0.72,w:9,h:0.3,fontSize:11,color:C.accent});
    sl.addShape(pptx.ShapeType.rect,{x:0,y:1.08,w:13.33,h:0.04,fill:{color:C.greenM}});
  };
  const ftr = (sl:any, info:string) =>
    sl.addText(`AutoBI  ·  ${info}`,{x:0.5,y:7.15,w:12.33,h:0.28,fontSize:8,color:'CBD5E1',align:'right'});
  const kpiIcon=(icon?:string)=>{
    const m:Record<string,string>={euro:'€',percent:'%',users:'♟',
      'trending-up':'↑','trending-down':'↓',target:'◎',clock:'⏱',package:'⬡',star:'★'};
    return m[icon||'']||'▣';
  };

  // ── COUVERTURE ────────────────────────────────────────────────────────────
  const s1=pptx.addSlide(); s1.background={color:C.dark};
  s1.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.12,h:7.5,fill:{color:C.greenM}});
  s1.addShape(pptx.ShapeType.rect,{x:10.5,y:5.5,w:2.83,h:2.0,fill:{color:C.green}});
  s1.addShape(pptx.ShapeType.rect,{x:11.5,y:4.5,w:1.83,h:1.1,fill:{color:C.accent}});
  s1.addShape(pptx.ShapeType.roundRect,{x:0.55,y:0.55,w:1.5,h:0.38,fill:{color:C.greenM},rectRadius:0.05});
  s1.addText('AUTOBI',{x:0.55,y:0.55,w:1.5,h:0.38,fontSize:11,bold:true,color:C.white,align:'center',valign:'middle'});
  s1.addText(summary.title||fileName,{x:0.55,y:1.6,w:9.5,h:1.5,fontSize:38,bold:true,color:C.white,fontFace:'Calibri',wrap:true});
  s1.addShape(pptx.ShapeType.rect,{x:0.55,y:3.3,w:5,h:0.04,fill:{color:C.greenM}});
  s1.addText(summary.description?.slice(0,200)||'',{x:0.55,y:3.5,w:9.5,h:1.8,fontSize:13,color:'94A3B8',wrap:true,lineSpacingMultiple:1.3});
  const dt=new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  s1.addText(`${(metadata.row_count||0).toLocaleString('fr-FR')} lignes  ·  ${metadata.column_count||0} colonnes  ·  ${dt}`,{x:0.55,y:5.6,w:9,h:0.38,fontSize:11,color:'475569'});
  s1.addShape(pptx.ShapeType.roundRect,{x:0.55,y:6.35,w:3.2,h:0.45,fill:{color:'1E293B'},line:{color:C.greenM,width:1},rectRadius:0.08});
  s1.addText('Rapport généré automatiquement par AUTOBI',{x:0.55,y:6.35,w:3.2,h:0.45,fontSize:8,color:C.accent,align:'center',valign:'middle',bold:true});

  // ── KEY TAKEAWAYS ─────────────────────────────────────────────────────────
  if(summary.key_takeaways?.length){
    const s2=pptx.addSlide(); s2.background={color:C.white};
    hdr(s2,'Points clés du rapport','Synthèse principale'); ftr(s2,'Points clés');
    summary.key_takeaways.slice(0,5).forEach((tk:string,i:number)=>{
      const y=1.35+i*1.08;
      s2.addShape(pptx.ShapeType.roundRect,{x:0.5,y,w:12.33,h:0.85,fill:{color:i%2?C.white:C.light},line:{color:C.border,width:0.5},rectRadius:0.08});
      s2.addShape(pptx.ShapeType.ellipse,{x:0.65,y:y+0.2,w:0.44,h:0.44,fill:{color:C.green}});
      s2.addText(`${i+1}`,{x:0.65,y:y+0.2,w:0.44,h:0.44,fontSize:12,bold:true,color:C.white,align:'center',valign:'middle'});
      s2.addText(tk,{x:1.28,y:y+0.18,w:11.3,h:0.5,fontSize:13,color:C.slate,wrap:true});
    });
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  if(kpis.length>0){
    const s3=pptx.addSlide(); s3.background={color:C.light};
    hdr(s3,'Indicateurs clés de performance','KPIs principaux'); ftr(s3,'KPIs');
    const count=Math.min(kpis.length,4); const cW=12.0/count;
    kpis.slice(0,4).forEach((kpi:any,i:number)=>{
      const x=0.66+i*(cW+0.1); const kH=5.55;
      s3.addShape(pptx.ShapeType.roundRect,{x:x+0.04,y:1.36,w:cW,h:kH,fill:{color:'E2E8F0'},rectRadius:0.12});
      s3.addShape(pptx.ShapeType.roundRect,{x,y:1.3,w:cW,h:kH,fill:{color:C.white},line:{color:C.border,width:0.5},rectRadius:0.12});
      s3.addShape(pptx.ShapeType.roundRect,{x,y:1.3,w:cW,h:0.18,fill:{color:C.chart[i%C.chart.length]},rectRadius:0.06});
      s3.addShape(pptx.ShapeType.ellipse,{x:x+0.2,y:1.65,w:0.55,h:0.55,fill:{color:C.greenL}});
      s3.addText(kpiIcon(kpi.icon),{x:x+0.2,y:1.65,w:0.55,h:0.55,fontSize:16,color:C.green,align:'center',valign:'middle'});
      if(kpi.trend&&kpi.trend!=='stable'){
        const up=kpi.trend==='up';
        s3.addShape(pptx.ShapeType.roundRect,{x:x+cW-1.3,y:1.72,w:1.1,h:0.32,fill:{color:up?C.greenL:'FEE2E2'},rectRadius:0.06});
        s3.addText((up?'↑ ':'↓ ')+(kpi.trend_value||'').slice(0,15),{x:x+cW-1.3,y:1.72,w:1.1,h:0.32,fontSize:8,bold:true,color:up?C.greenD:'991B1B',align:'center',valign:'middle'});
      }
      s3.addText(kpi.label.toUpperCase(),{x:x+0.18,y:2.35,w:cW-0.3,h:0.32,fontSize:8,color:C.gray,bold:true});
      const vt=kpi.value+(kpi.unit&&!String(kpi.value).toLowerCase().includes(String(kpi.unit).toLowerCase())?` ${kpi.unit}`:'');
      s3.addText(vt,{x:x+0.18,y:2.72,w:cW-0.3,h:0.9,fontSize:24,bold:true,color:C.dark,wrap:true,fontFace:'Calibri'});
      s3.addShape(pptx.ShapeType.rect,{x:x+0.18,y:3.8,w:cW-0.5,h:0.02,fill:{color:C.border}});
      if(kpi.description) s3.addText(kpi.description.slice(0,150),{x:x+0.18,y:3.95,w:cW-0.3,h:2.2,fontSize:10,color:C.gray,wrap:true,lineSpacingMultiple:1.2});
    });
  }

  // ── SLIDES GRAPHIQUES ─────────────────────────────────────────────────────
  charts.forEach((chart:any,ci:number)=>{
    const sc=pptx.addSlide(); sc.background={color:C.white};
    hdr(sc,chart.title,chart.type.toUpperCase()+' — Visualisation');
    ftr(sc,`Graphique ${ci+1}/${charts.length}`);
    if(chart.insight){
      sc.addShape(pptx.ShapeType.roundRect,{x:0.5,y:1.18,w:12.33,h:0.45,fill:{color:C.greenL},line:{color:C.accent,width:0.5},rectRadius:0.06});
      sc.addText(`✦  ${chart.insight}`,{x:0.65,y:1.18,w:12,h:0.45,fontSize:11,color:C.greenD,bold:true,valign:'middle'});
    }
    const cY=chart.insight?1.75:1.3;
    const cH=chart.insight?4.65:5.1;
    const labels=chart.data?.labels||[];
    const datasets=chart.data?.datasets||[];

    // BAR
    if((chart.type==='bar')&&labels.length&&datasets.length){
      const cd=datasets.map((ds:any,idx:number)=>({
        name:ds.label||`Série ${idx+1}`, labels,
        values:ds.data.map((v:any)=>typeof v==='number'?v:Number(v)||0),
      }));
      sc.addChart('bar',cd,{x:0.5,y:cY,w:12.33,h:cH,chartColors:C.chart,showLegend:datasets.length>1,legendPos:'b',legendFontSize:10,showTitle:false,valAxisLabelFontSize:10,catAxisLabelFontSize:10,barGapWidthPct:55,valGridLine:{style:'solid',color:'E2E8F0',size:0.5},plotArea:{fill:{color:C.white}}});

    // LINE
    } else if(chart.type==='line'&&labels.length&&datasets.length){
      const cd=datasets.map((ds:any,idx:number)=>({
        name:ds.label||`Série ${idx+1}`, labels,
        values:ds.data.map((v:any)=>typeof v==='number'?v:Number(v)||0),
      }));
      sc.addChart('line',cd,{x:0.5,y:cY,w:12.33,h:cH,chartColors:C.chart,showLegend:datasets.length>1,legendPos:'b',legendFontSize:10,showTitle:false,lineDataSymbol:'circle',lineDataSymbolSize:5,lineSmooth:true,lineSize:2,valGridLine:{style:'solid',color:'E2E8F0',size:0.5},plotArea:{fill:{color:C.white}}});

    // PIE / DOUGHNUT
    } else if((chart.type==='pie'||chart.type==='doughnut')&&labels.length&&datasets.length){
      const raw=(datasets[0]?.data||[]).map((v:any)=>typeof v==='number'?v:Number(v)||0);
      const total=raw.reduce((a:number,b:number)=>a+b,0)||1;
      sc.addChart('pie',[{name:chart.title,labels:labels.map((l:string)=>String(l)),values:raw}],{
        x:0.5,y:cY,w:8.5,h:cH,chartColors:C.chart,showLegend:true,legendPos:'r',
        legendFontSize:11,showTitle:false,dataLabelFontSize:10,dataLabelFontBold:true,
        showPercent:true,plotArea:{fill:{color:C.white}},
      });
      // Table %
      const tX=9.2;
      labels.slice(0,10).forEach((lbl:string,i:number)=>{
        const ty=cY+0.15+i*((cH-0.3)/Math.min(labels.length,10));
        sc.addShape(pptx.ShapeType.rect,{x:tX,y:ty,w:0.24,h:0.24,fill:{color:C.chart[i%C.chart.length]}});
        sc.addText(String(lbl),{x:tX+0.32,y:ty-0.05,w:2.8,h:0.34,fontSize:10,color:C.slate});
        sc.addText(((raw[i]||0)/total*100).toFixed(1)+'%',{x:tX+3.2,y:ty-0.05,w:0.9,h:0.34,fontSize:10,bold:true,color:C.chart[i%C.chart.length],align:'right'});
      });

    // SCATTER
    } else if(chart.type==='scatter'&&datasets.length){
      const series=datasets
        .map((ds:any,idx:number)=>{
          const pts=(ds.data||[]).filter((p:any)=>p&&typeof p.x==='number'&&typeof p.y==='number');
          return {name:ds.label||`Série ${idx+1}`,values:pts.map((p:any)=>({x:Number(p.x),y:Number(p.y)}))};
        })
        .filter((s:any)=>s.values.length>0);
      if(series.length>0){
        sc.addChart('scatter',series,{
          x:0.5,y:cY,w:12.33,h:cH,chartColors:C.chart,
          showLegend:series.length>1,legendPos:'b',legendFontSize:10,showTitle:false,
          lineSize:0,lineDataSymbol:'circle',lineDataSymbolSize:8,
          valGridLine:{style:'solid',color:'E2E8F0',size:0.5},
          catGridLine:{style:'solid',color:'E2E8F0',size:0.5},
          valAxisLabelFontSize:10,catAxisLabelFontSize:10,
          plotArea:{fill:{color:C.white}},
        });
        // Corrélation
        const allX=series[0].values.map((p:any)=>p.x);
        const allY=series[0].values.map((p:any)=>p.y);
        const n=allX.length;
        if(n>1){
          const sX=allX.reduce((a:number,b:number)=>a+b,0);
          const sY=allY.reduce((a:number,b:number)=>a+b,0);
          const sXY=allX.reduce((a:number,b:number,i:number)=>a+b*allY[i],0);
          const sX2=allX.reduce((a:number,b:number)=>a+b*b,0);
          const sY2=allY.reduce((a:number,b:number)=>a+b*b,0);
          const num=n*sXY-sX*sY;
          const den=Math.sqrt(Math.max(0,(n*sX2-sX*sX)*(n*sY2-sY*sY)));
          if(den>0){
            const r=(num/den).toFixed(3);
            sc.addShape(pptx.ShapeType.roundRect,{x:10.5,y:cY+0.1,w:2.3,h:0.55,fill:{color:C.light},line:{color:C.border,width:0.5},rectRadius:0.06});
            sc.addText(`r = ${r}`,{x:10.5,y:cY+0.1,w:2.3,h:0.55,fontSize:12,bold:true,color:C.dark,align:'center',valign:'middle'});
          }
        }
      } else {
        sc.addText('Données scatter insuffisantes.',{x:2,y:cY+2,w:9.33,h:1,fontSize:14,color:C.gray,align:'center'});
      }

    } else {
      sc.addText('Type de graphique non supporté : '+chart.type,{x:2,y:cY+2,w:9.33,h:1,fontSize:12,color:C.gray,align:'center'});
    }

    if(chart.description){
      sc.addShape(pptx.ShapeType.rect,{x:0.5,y:6.55,w:12.33,h:0.02,fill:{color:C.border}});
      sc.addText(chart.description.slice(0,220),{x:0.5,y:6.62,w:12.33,h:0.42,fontSize:9,color:C.gray,italic:true,wrap:true});
    }
  });

  // ── INSIGHTS ──────────────────────────────────────────────────────────────
  if(insights.length>0){
    for(let page=0;page<Math.ceil(insights.length/2);page++){
      const si=pptx.addSlide(); si.background={color:C.light};
      hdr(si,'Insights & Recommandations',`${page+1}/${Math.ceil(insights.length/2)}`);
      ftr(si,'Insights');
      insights.slice(page*2,page*2+2).forEach((ins:any,i:number)=>{
        const x=i===0?0.5:7.0; const cW2=5.9; const bc=C.chart[(page*2+i)%C.chart.length];
        si.addShape(pptx.ShapeType.roundRect,{x:x+0.05,y:1.4,w:cW2,h:5.7,fill:{color:'DDE3EA'},rectRadius:0.1});
        si.addShape(pptx.ShapeType.roundRect,{x,y:1.3,w:cW2,h:5.7,fill:{color:C.white},line:{color:C.border,width:0.5},rectRadius:0.1});
        si.addShape(pptx.ShapeType.roundRect,{x,y:1.3,w:cW2,h:0.22,fill:{color:bc},rectRadius:0.06});
        si.addShape(pptx.ShapeType.ellipse,{x:x+0.2,y:1.65,w:0.42,h:0.42,fill:{color:bc}});
        si.addText(`${page*2+i+1}`,{x:x+0.2,y:1.65,w:0.42,h:0.42,fontSize:12,bold:true,color:C.white,align:'center',valign:'middle'});
        si.addText(ins.title,{x:x+0.75,y:1.65,w:cW2-0.9,h:0.55,fontSize:13,bold:true,color:C.dark,wrap:true});
        if(ins.value){
          si.addShape(pptx.ShapeType.roundRect,{x:x+0.2,y:2.35,w:cW2-0.4,h:0.6,fill:{color:C.light},rectRadius:0.05});
          si.addText(ins.value.slice(0,80),{x:x+0.3,y:2.35,w:cW2-0.5,h:0.6,fontSize:13,bold:true,color:bc,wrap:true,valign:'middle'});
        }
        if(ins.description) si.addText(ins.description.slice(0,250),{x:x+0.2,y:3.1,w:cW2-0.4,h:2.0,fontSize:10.5,color:C.gray,wrap:true,lineSpacingMultiple:1.25});
        if(ins.interpretation){
          si.addShape(pptx.ShapeType.roundRect,{x:x+0.2,y:5.3,w:cW2-0.4,h:1.3,fill:{color:C.greenL},line:{color:C.accent,width:0.5},rectRadius:0.07});
          si.addText('RECOMMANDATION',{x:x+0.35,y:5.35,w:cW2-0.6,h:0.25,fontSize:7,bold:true,color:C.green,charSpacing:0.8});
          si.addText(ins.interpretation.slice(0,160),{x:x+0.35,y:5.62,w:cW2-0.6,h:0.9,fontSize:10,color:C.greenD,italic:true,wrap:true});
        }
      });
    }
  }

  // ── FINALE ────────────────────────────────────────────────────────────────
  const sf=pptx.addSlide(); sf.background={color:C.dark};
  sf.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.14,h:7.5,fill:{color:C.greenM}});
  sf.addShape(pptx.ShapeType.rect,{x:9.5,y:0,w:3.83,h:7.5,fill:{color:'0F1F12'}});
  sf.addShape(pptx.ShapeType.rect,{x:9.62,y:1.5,w:2.5,h:0.08,fill:{color:C.greenM}});
  sf.addShape(pptx.ShapeType.rect,{x:9.62,y:5.8,w:2.5,h:0.08,fill:{color:C.greenM}});
  sf.addText('AUTO',{x:0.5,y:2.2,w:9,h:1.8,fontSize:72,bold:true,color:C.white,fontFace:'Calibri'});
  sf.addText('BI',{x:0.5,y:3.5,w:9,h:1.8,fontSize:72,bold:true,color:C.greenM,fontFace:'Calibri'});
  sf.addText('Rapport généré automatiquement par AUTOBI',{x:0.5,y:5.5,w:8.5,h:0.45,fontSize:13,color:'475569'});
  sf.addShape(pptx.ShapeType.rect,{x:0.5,y:6.05,w:4,h:0.03,fill:{color:C.greenM}});
  sf.addText(`${analysis.file_name}  ·  Analyse #${analysis.analysis_id}  ·  ${analysis.tokens_consumed||0} jeton(s)`,{x:0.5,y:6.22,w:9,h:0.35,fontSize:10,color:'334155'});

  pptx.writeFile({fileName:`${fileName}_rapport.pptx`});
}



// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function KpiIcon({ icon }: { icon?: string }) {
  const cls = 'text-emerald-600'; const sz = 20;
  switch (icon) {
    case 'euro': return <Euro size={sz} className={cls} />;
    case 'percent': return <Percent size={sz} className={cls} />;
    case 'users': return <Users size={sz} className={cls} />;
    case 'trending-up': return <TrendingUp size={sz} className={cls} />;
    case 'trending-down': return <TrendingDown size={sz} className="text-red-500" />;
    case 'target': return <Target size={sz} className={cls} />;
    case 'clock': return <Clock size={sz} className={cls} />;
    case 'package': return <Package size={sz} className={cls} />;
    case 'star': return <Star size={sz} className={cls} />;
    default: return <BarChart3 size={sz} className={cls} />;
  }
}

const KpiCard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-emerald-50 rounded-lg"><KpiIcon icon={kpi.icon} /></div>
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 break-words">{kpi.label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight break-words">
        {kpi.value}
        {kpi.unit && !String(kpi.value).toLowerCase().includes(String(kpi.unit).toLowerCase()) && (
          <span className="text-sm font-normal text-gray-400 ml-1">{kpi.unit}</span>
        )}
      </p>
      {kpi.description && <p className="text-xs text-gray-400 mt-2 leading-relaxed break-words">{kpi.description}</p>}
    </div>
  );
};

const ChartCard: React.FC<{ chart: ChartItem }> = ({ chart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const chartData = buildChartJsData(chart);
  const chartOpts = buildChartOptions(chart);
  if (!chartData) return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm flex items-center justify-center h-64 sm:h-80 min-w-0">
      <p className="text-gray-400 text-sm">Données insuffisantes pour ce graphique</p>
    </div>
  );
  const getTypeIcon = () => {
    switch (chart.type) {
      case 'line': return <TrendingUp size={14} className="text-blue-500" />;
      case 'pie': case 'doughnut': return <PieChart size={14} className="text-violet-500" />;
      case 'scatter': return <Crosshair size={14} className="text-purple-500" />;
      default: return <BarChart3 size={14} className="text-amber-500" />;
    }
  };
  const pieDoughnutOpts = { responsive: true, maintainAspectRatio: false, animation: { duration: 700 }, onResize: (context: any, size: any) => { context.options.plugins.legend.position = size.width < 420 ? 'bottom' : 'right'; }, plugins: { legend: { position: 'right' as const, labels: { padding: 10, font: { size: 10 }, boxWidth: 10 } }, tooltip: chartOpts.plugins.tooltip } };
  const scatterOpts = { ...chartOpts, plugins: { ...chartOpts.plugins, tooltip: { ...chartOpts.plugins.tooltip, mode: 'point' as const, intersect: true } } };
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow min-w-0 w-full">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
          {getTypeIcon()}
          <h3 className="font-semibold text-sm text-gray-800 flex-1 min-w-0 break-words">{chart.title}</h3>
          <span className="text-xs text-gray-300 uppercase tracking-widest shrink-0">{chart.type}</span>
        </div>
        {chart.insight && <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg inline-block mt-1 max-w-full break-words">✦ {chart.insight}</p>}
      </div>
      <div className="px-2 sm:px-4 pb-2 w-full min-w-0 relative" style={{ height: 280 }}>
        {chart.type === 'bar' && <Bar data={chartData} options={chartOpts as any} />}
        {chart.type === 'line' && <Line data={chartData} options={chartOpts as any} />}
        {chart.type === 'pie' && <Pie data={chartData} options={pieDoughnutOpts as any} />}
        {chart.type === 'doughnut' && <Doughnut data={chartData} options={pieDoughnutOpts as any} />}
        {chart.type === 'scatter' && <ScatterChart data={chartData} options={scatterOpts as any} />}
      </div>
      {chart.description && (
        <div className="border-t border-gray-100">
          <button onClick={() => setShowDetail(!showDetail)} className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="flex items-center gap-1.5"><Zap size={11} className="text-emerald-500" />Analyse détaillée</span>
            {showDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showDetail && <div className="px-4 sm:px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3 break-words">{chart.description}</div>}
        </div>
      )}
    </div>
  );
};

const InsightCard: React.FC<{ insight: InsightItem; index: number }> = ({ insight, index }) => {
  const colors = ['border-l-emerald-400 bg-emerald-50/40','border-l-blue-400 bg-blue-50/40','border-l-amber-400 bg-amber-50/40','border-l-violet-400 bg-violet-50/40','border-l-rose-400 bg-rose-50/40','border-l-teal-400 bg-teal-50/40'];
  const dotColors = ['bg-emerald-400','bg-blue-400','bg-amber-400','bg-violet-400','bg-rose-400','bg-teal-400'];
  return (
    <div className={`border-l-4 rounded-r-xl p-3 sm:p-4 min-w-0 break-words ${colors[index % colors.length]}`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[index % dotColors.length]}`} />
        <h4 className="font-semibold text-sm text-gray-800">{insight.title}</h4>
      </div>
      {insight.value && <p className="text-base font-bold text-gray-900 ml-4 mb-1">{insight.value}</p>}
      {insight.description && <p className="text-xs text-gray-500 ml-4 leading-relaxed">{insight.description}</p>}
      {insight.interpretation && (
        <div className="mt-2 ml-4 pt-2 border-t border-white/60">
          <p className="text-xs text-gray-400 italic">→ {insight.interpretation}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RAPPORT (rendu + capturé pour PDF)
// ============================================================================
const ReportContent: React.FC<{ analysis: any }> = ({ analysis }) => {
  const summaryObj: ReportSummary = analysis.summary || {};
  const kpis: KPI[] = analysis.kpis || [];
  const charts: ChartItem[] = analysis.charts || [];
  const insights: InsightItem[] = analysis.insights || [];
  const metadata = analysis.metadata || {};
  const fileName = analysis.file_name?.replace(/\.[^/.]+$/, '') || 'Analyse';
  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 min-w-0 w-full overflow-x-hidden">
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">{summaryObj.title || fileName}</h2>
            <p className="text-sm text-gray-400 mt-1">{(metadata.row_count || 0).toLocaleString('fr-FR')} lignes · {metadata.column_count || 0} colonnes · {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 self-start shrink-0"><Zap size={11} /> Analysé par l'IA</span>
        </div>
        {summaryObj.description && <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">{summaryObj.description}</p>}
        {summaryObj.key_takeaways && summaryObj.key_takeaways.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {summaryObj.key_takeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold text-xs mt-0.5">✦</span>
                <p className="text-sm text-gray-600 break-words min-w-0">{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {kpis.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Indicateurs clés</p>
          <div className={`grid gap-4 ${kpis.length === 1 ? 'grid-cols-1' : kpis.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : kpis.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'}`}>
            {kpis.map(kpi => <KpiCard key={kpi.id} kpi={kpi} />)}
          </div>
        </div>
      )}
      {charts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Visualisations ({charts.length})</p>
          <div className={`grid gap-4 sm:gap-5 min-w-0 ${charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {charts.map(chart => <ChartCard key={chart.id} chart={chart} />)}
          </div>
        </div>
      )}
      {insights.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Insights détaillés</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, i) => <InsightCard key={ins.id || i} insight={ins} index={i} />)}
          </div>
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-2 text-xs text-gray-300 min-w-0 break-words">
        <span>AutoBI · {analysis.file_name}</span>
        <span>Analyse #{analysis.analysis_id} · {analysis.tokens_consumed || 0} jeton(s)</span>
        <span className="text-green-700">L'IA d'autoBI peut faire des erreurs, une vérification peut etre nécéssaire</span>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export const Dashboard: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPPTX, setExportingPPTX] = useState(false);

  useEffect(() => { if (analysisId) loadAnalysis(); refreshUser(); }, [analysisId]);

  const loadAnalysis = async () => {
    setIsLoading(true); setError(null);
    try { const data = await fetchAnalysis(analysisId!); setAnalysis(data); }
    catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  };

  const fileName = analysis?.file_name?.replace(/\.[^/.]+$/, '') || 'rapport';

  const handlePrint = () => {
    const summary = analysis.summary || {};
    const kpis    = analysis.kpis    || [];
    const charts  = analysis.charts  || [];
    const insights= analysis.insights|| [];
    const metadata= analysis.metadata|| {};
    const fileLabel=(analysis.file_name||'Analyse').replace(/\.[^/.]+$/,'');
    const dateStr = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

    // Capture les graphiques Chart.js en PNG avant d'ouvrir la fenêtre
    const canvasImages: Record<string,string> = {};
    document.querySelectorAll<HTMLCanvasElement>('canvas').forEach((c,i) => {
      try { canvasImages[`chart_${i}`] = c.toDataURL('image/png'); } catch(_){}
    });

    const CHART_COLORS = ['#059669','#3B82F6','#D97706','#7C3AED','#DB2777','#0891B2','#EA580C','#4F46E5','#16A34A','#DC2626'];

    const kpiCards = kpis.map((kpi:any, i:number) => {
      const vt = String(kpi.value||'') + (kpi.unit && !String(kpi.value).toLowerCase().includes(String(kpi.unit).toLowerCase()) ? ' '+kpi.unit : '');
      return `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 14px;break-inside:avoid;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${CHART_COLORS[i%CHART_COLORS.length]};border-radius:12px 12px 0 0"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:8px">
          <p style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px">${kpi.label||''}</p>
        </div>
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;line-height:1.1">${vt}</p>
        <p style="font-size:10px;color:#94a3b8;margin:0;line-height:1.4">${(kpi.description||'').slice(0,100)}</p>
      </div>`;
    }).join('');

    const chartSections = charts.map((_:any, i:number) => {
      const chart = charts[i];
      const img   = canvasImages[`chart_${i}`];
      const cleanTitle = (chart.title||'').replace(/\b(BAR|LINE|PIE|DOUGHNUT|SCATTER)\b/gi,'').replace(/—\s*(Visualisation|Graphique)\s*/gi,'').trim();
      return `<div style="break-inside:avoid;margin-bottom:24px">
        <h3 style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px">${cleanTitle}</h3>
        ${chart.insight?`<div style="background:#ecfdf5;border:1px solid #34d399;border-radius:6px;padding:5px 10px;margin-bottom:8px;font-size:10px;font-weight:600;color:#065f46">✦ ${chart.insight}</div>`:''}
        ${img?`<img src="${img}" style="width:100%;max-height:220px;object-fit:contain;border-radius:8px;border:1px solid #e2e8f0" />`:'<div style="height:180px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:11px">Graphique non disponible</div>'}
        ${chart.description?`<p style="font-size:10px;color:#64748b;font-style:italic;margin:6px 0 0;line-height:1.5">${chart.description}</p>`:''}
      </div>`;
    }).join('');

    const insightCards = insights.map((ins:any, i:number) => `
      <div style="break-inside:avoid;border-left:3px solid ${CHART_COLORS[i%CHART_COLORS.length]};padding:10px 12px;margin-bottom:12px;background:#f8fafc;border-radius:0 8px 8px 0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <p style="font-size:12px;font-weight:700;color:#0f172a;margin:0">${ins.title||''}</p>
          <span style="font-size:9px;font-weight:600;background:#e2e8f0;color:#475569;padding:2px 6px;border-radius:999px">${ins.type||'analyse'}</span>
        </div>
        ${ins.value?`<p style="font-size:13px;font-weight:800;color:${CHART_COLORS[i%CHART_COLORS.length]};margin:0 0 4px">${ins.value}</p>`:''}
        ${ins.description?`<p style="font-size:10px;color:#64748b;margin:0 0 6px;line-height:1.5">${ins.description}</p>`:''}
        ${ins.interpretation?`<div style="background:#ecfdf5;border-radius:4px;padding:5px 8px;font-size:10px;color:#065f46;font-style:italic">→ ${ins.interpretation}</div>`:''}
      </div>`
    ).join('');

    const numCols: string[] = metadata.numeric_columns || [];
    const stats = metadata.statistics || {};
    const statsRows = numCols.map((col:string) => {
      const s = stats[col]||{};
      const fmt=(v:any)=>{ if(v===null||v===undefined) return '—'; const n=Number(v); if(isNaN(n)) return String(v); if(Math.abs(n)>=1e6) return (n/1e6).toFixed(1)+'M'; if(Math.abs(n)>=1e3) return (n/1e3).toFixed(1)+'K'; return n%1===0?n.toLocaleString('fr-FR'):n.toLocaleString('fr-FR',{maximumFractionDigits:2}); };
      return `<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:5px 8px;font-weight:600;color:#1e293b;font-size:10px">${col}</td><td style="padding:5px 8px;text-align:right;font-size:10px;color:#475569">${fmt(s.mean)}</td><td style="padding:5px 8px;text-align:right;font-size:10px;color:#475569">${fmt(s.median)}</td><td style="padding:5px 8px;text-align:right;font-size:10px;color:#475569">${fmt(s.min)}</td><td style="padding:5px 8px;text-align:right;font-size:10px;color:#475569">${fmt(s.max)}</td><td style="padding:5px 8px;text-align:right;font-size:10px;color:#475569">${fmt(s.std)}</td></tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
    <title>${fileLabel} — Rapport AutoBI</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #fff; font-size: 11px; }
      .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm 14mm 12mm; }
      .cover { background: #0f172a; color: #fff; padding: 40px; min-height: 200px; border-radius: 0 0 12px 12px; margin-bottom: 24px; position: relative; overflow: hidden; }
      .cover::after { content: ''; position: absolute; right: 0; bottom: 0; width: 80px; height: 100%; background: linear-gradient(135deg, transparent 50%, #059669 50%); opacity: .4; }
      .cover-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: #10B981; }
      .section-header { background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 8px; margin: 20px 0 14px; display: flex; align-items: center; gap: 8px; }
      .section-header h2 { font-size: 13px; font-weight: 700; }
      .section-header span { font-size: 10px; color: #34d399; }
      .green-bar { height: 3px; background: #10B981; border-radius: 3px; margin-bottom: 16px; }
      .kpi-grid { display: grid; grid-template-columns: repeat(${Math.min(kpis.length,2)}, 1fr); gap: 12px; margin-bottom: 20px; }
      .stats-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      .stats-table th { background: #0f172a; color: #fff; padding: 6px 8px; text-align: left; font-size: 9.5px; }
      .stats-table th:not(:first-child) { text-align: right; }
      .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
      .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
      .meta-card .val { font-size: 18px; font-weight: 800; color: #059669; }
      .meta-card .lbl { font-size: 9px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: .06em; }
      .footer-bar { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { size: A4; margin: 8mm; }
        .page { width: 100%; padding: 0; }
        .no-break { break-inside: avoid; }
      }
    </style>
    </head><body><div class="page">

      <!-- COUVERTURE -->
      <div class="cover">
        <div class="cover-bar"></div>
        <div style="display:inline-block;background:#10B981;color:#fff;font-size:9px;font-weight:700;padding:3px 10px;border-radius:999px;margin-bottom:16px;letter-spacing:.1em">AUTOBI</div>
        <h1 style="font-size:24px;font-weight:800;line-height:1.2;margin-bottom:12px;max-width:80%">${summary.title||fileLabel}</h1>
        <div style="width:50px;height:2px;background:#10B981;margin-bottom:12px"></div>
        <p style="color:#94a3b8;font-size:11px;line-height:1.6;max-width:75%">${(summary.description||'').slice(0,250)}</p>
        <p style="color:#475569;font-size:10px;margin-top:16px">${(metadata.row_count||0).toLocaleString('fr-FR')} lignes · ${metadata.column_count||0} colonnes · ${dateStr}</p>
      </div>

      ${summary.key_takeaways?.length ? `
      <div class="no-break">
        <div class="section-header"><div style="width:3px;height:16px;background:#10B981;border-radius:2px"></div><h2>Points clés</h2></div>
        ${summary.key_takeaways.slice(0,5).map((t:string,i:number)=>`
          <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;background:${i%2?'#fff':'#f8fafc'};border-radius:6px;margin-bottom:4px;border:1px solid #f1f5f9">
            <div style="min-width:20px;height:20px;background:#059669;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${i+1}</div>
            <p style="font-size:10.5px;color:#1e293b;line-height:1.5;margin:1px 0">${t}</p>
          </div>`).join('')}
      </div>` : ''}

      <!-- MÉTHODOLOGIE -->
      <div class="section-header" style="margin-top:24px"><div style="width:3px;height:16px;background:#10B981;border-radius:2px"></div><h2>Méthodologie & Données</h2><span>Structure du dataset</span></div>
      <div class="meta-grid">
        <div class="meta-card"><div class="val">${(metadata.row_count||0).toLocaleString('fr-FR')}</div><div class="lbl">Lignes</div></div>
        <div class="meta-card"><div class="val">${metadata.column_count||0}</div><div class="lbl">Colonnes</div></div>
        <div class="meta-card"><div class="val" style="color:${(metadata.missing_values||0)>0?'#d97706':'#059669'}">${metadata.missing_values||0}</div><div class="lbl">Valeurs manquantes</div></div>
      </div>
      ${statsRows ? `
      <table class="stats-table">
        <thead><tr><th>Variable</th><th>Moyenne</th><th>Médiane</th><th>Min</th><th>Max</th><th>Écart-type</th></tr></thead>
        <tbody>${statsRows}</tbody>
      </table>` : ''}

      <!-- KPIs -->
      ${kpis.length ? `
      <div class="section-header"><div style="width:3px;height:16px;background:#10B981;border-radius:2px"></div><h2>Indicateurs clés</h2><span>${kpis.length} KPIs</span></div>
      <div class="kpi-grid">${kpiCards}</div>` : ''}

      <!-- GRAPHIQUES -->
      ${charts.length ? `
      <div class="section-header"><div style="width:3px;height:16px;background:#10B981;border-radius:2px"></div><h2>Visualisations</h2><span>${charts.length} graphiques</span></div>
      ${chartSections}` : ''}

      <!-- INSIGHTS -->
      ${insights.length ? `
      <div class="section-header"><div style="width:3px;height:16px;background:#10B981;border-radius:2px"></div><h2>Insights & Recommandations</h2></div>
      ${insightCards}` : ''}

      <!-- PIED DE PAGE -->
      <div class="footer-bar">
        <span>AutoBI — Rapport d'analyse de données</span>
        <span>${fileLabel} · ${dateStr}</span>
      </div>

    </div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
    </body></html>`;

    const w = window.open('','_blank','width=900,height=700');
    if(w){ w.document.write(html); w.document.close(); }
  };

  const handleExportPPTX = async () => {
    setExportingPPTX(true);
    try { await exportToPPTX(analysis, fileName); }
    catch (e) { console.error('PPTX error:', e); alert('Erreur lors de la génération du PowerPoint.'); }
    finally { setExportingPPTX(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><Loader className="animate-spin mx-auto mb-4 text-emerald-500" size={40} /><p className="text-gray-400 text-sm">Chargement du dashboard...</p></div>
    </div>
  );

  if (error || !analysis) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm max-w-md w-full p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
        <h3 className="font-semibold mb-2 text-gray-800">Analyse introuvable</h3>
        <p className="text-gray-400 mb-4 text-sm">{error}</p>
        <button onClick={() => navigate('/history')} className="btn btn-outline btn-sm gap-2"><ArrowLeft size={16} /> Historique</button>
      </div>
    </div>
  );

  const metadata = analysis.metadata || {};
  const summaryObj: ReportSummary = analysis.summary || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .bg-gray-50 { background: white !important; }
          @page { margin: 10mm; size: A4; }
        }
      ` }} />
      {/* NAVBAR */}
      <div className="no-print bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
            <button onClick={() => navigate('/history')} className="btn btn-ghost btn-sm gap-2 min-h-10"><ArrowLeft size={16} /> Historique</button>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight break-words">{summaryObj.title || fileName}</h1>
              <p className="text-xs text-gray-400">{(metadata.row_count || 0).toLocaleString('fr-FR')} lignes · {metadata.column_count || 0} colonnes</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"><Zap size={10} /> IA</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto sm:justify-end">
            <button onClick={() => { loadAnalysis(); refreshUser(); }} className="btn btn-ghost btn-sm min-h-10" title="Rafraîchir"><RefreshCw size={15} /></button>

            {/* Bouton Imprimer */}
            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm gap-2 min-h-10"
              title="Imprimer le rapport"
            >
              <Printer size={15} /> Imprimer
            </button>

            {/* Bouton PowerPoint — téléchargement direct */}
            <button onClick={handleExportPPTX} disabled={exportingPPTX} className="btn btn-success btn-sm gap-2 min-h-10" title="Télécharger en PowerPoint">
              {exportingPPTX
                ? <><span className="loading loading-spinner loading-xs" />PPTX...</>
                : <><Download size={15} />PowerPoint</>}
            </button>
          </div>
        </div>
      </div>

      {/* RAPPORT */}
      <ReportContent analysis={analysis} />
    </div>
  );
};