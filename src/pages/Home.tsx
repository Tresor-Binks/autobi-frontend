
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  FileJson,
  FileCode2,
  FileText,
  Database,
  Table2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  History,
  Plus,
  MessageSquare,
  BarChart3,
  Clock3,
  Zap,
  ChevronRight,
  Search,
  Layers3,
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const connectors = [
    {
      id: 'excel',
      name: 'Excel',
      extensions: '.xlsx, .xls',
      description: 'Classeurs et feuilles de calcul',
      icon: FileSpreadsheet,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'hover:border-success/50',
    },
    {
      id: 'csv',
      name: 'CSV',
      extensions: '.csv',
      description: 'Fichiers de données délimitées',
      icon: Table2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'hover:border-blue-500/50',
    },
    {
      id: 'json',
      name: 'JSON',
      extensions: '.json',
      description: 'Données structurées et API',
      icon: FileJson,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'hover:border-amber-500/50',
    },
    {
      id: 'tsv',
      name: 'TSV',
      extensions: '.tsv',
      description: 'Données séparées par tabulations',
      icon: FileText,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      border: 'hover:border-violet-500/50',
    },
    {
      id: 'parquet',
      name: 'Parquet',
      extensions: '.parquet',
      description: 'Données optimisées pour la Data',
      icon: Database,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'hover:border-orange-500/50',
    },
    {
      id: 'xml',
      name: 'XML',
      extensions: '.xml',
      description: 'Données structurées hiérarchiques',
      icon: FileCode2,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'hover:border-cyan-500/50',
    },
  ];

  const handleAnalysis = () => {
    navigate('/analysis');
  };

  const handleAI = () => {
    navigate('/ai');
  };

  return (
    <div className="min-h-screen bg-base-200/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-10">


        {/* QUICK ACTIONS */}
        <section>
          <div className="flex items-center justify-between mb-5">
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ANALYSIS CARD */}
            <button
              onClick={handleAnalysis}
              className="group relative overflow-hidden text-left rounded-2xl bg-base-100 border border-base-300 p-6 hover:border-success/50 hover:shadow-md transition-all"
            >
              <div className="absolute -right-8 -bottom-12 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <BarChart3 size={180} />
              </div>

              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-success/10 text-success mb-5">
                  <BarChart3 size={25} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-lg">
                    Nouvelle analyse
                  </h3>
                  <ArrowRight
                    size={20}
                    className="text-base-content/40 group-hover:text-success group-hover:translate-x-1 transition-all"
                  />
                </div>

                <p className="text-sm text-base-content/60 mt-2 max-w-sm">
                  Importez un fichier, explorez vos données et générez
                  automatiquement des tableaux de bord.
                </p>

                <span className="inline-flex items-center gap-2 text-success text-sm font-semibold mt-6">
                  Commencer
                  <ChevronRight size={16} />
                </span>
              </div>
            </button>

            {/* AI CARD */}
            <button
              onClick={handleAI}
              className="group relative overflow-hidden text-left rounded-2xl bg-base-100 border border-base-300 p-6 hover:border-violet-500/50 hover:shadow-md transition-all"
            >
              <div className="absolute -right-8 -bottom-12 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <Sparkles size={180} />
              </div>

              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 mb-5">
                  <Sparkles size={25} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-lg">
                    Comprendre mes analyses
                  </h3>
                  <ArrowRight
                    size={20}
                    className="text-base-content/40 group-hover:text-violet-500 group-hover:translate-x-1 transition-all"
                  />
                </div>

                <p className="text-sm text-base-content/60 mt-2 max-w-sm">
                  Retrouvez vos analyses précédentes et demandez à l'IA
                  d'expliquer vos résultats et vos insights.
                </p>

                <span className="inline-flex items-center gap-2 text-violet-500 text-sm font-semibold mt-6">
                  Interroger l'IA
                  <ChevronRight size={16} />
                </span>
              </div>
            </button>

          </div>
        </section>

        {/* MAIN HERO / IMPORT */}
        <section className="relative overflow-hidden rounded-2xl bg-base-100 border border-base-300 shadow-sm">
          <div className="absolute -right-20 -top-32 w-96 h-96 rounded-full bg-success/5 blur-3xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 w-64 h-64 rounded-full bg-success/5 blur-3xl pointer-events-none" />

          <div className="relative p-6 sm:p-9">
            <div className="flex items-center gap-2 mb-5">                
            </div>

            {/* CONNECTORS */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">
                Connecter une source de données
              </h3>
              <span className="text-xs text-base-content/50">
                6 formats disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectors.map((connector) => {
                const Icon = connector.icon;

                return (
                  <button
                    key={connector.id}
                    onClick={handleAnalysis}
                    className={`
                      group flex items-center gap-4 text-left
                      p-4 rounded-xl border border-base-300
                      bg-base-100 transition-all duration-200
                      hover:shadow-md hover:-translate-y-0.5
                      ${connector.border}
                    `}
                  >
                    <div
                      className={`
                        flex items-center justify-center
                        w-12 h-12 rounded-xl flex-shrink-0
                        ${connector.bg} ${connector.color}
                      `}
                    >
                      <Icon size={25} strokeWidth={1.8} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">
                          {connector.name}
                        </span>
                        <ArrowUpRight
                          size={16}
                          className="text-base-content/30 group-hover:text-success transition-colors"
                        />
                      </div>

                      <p className="text-xs text-base-content/50 mt-1">
                        {connector.extensions}
                      </p>

                      <p className="text-xs text-base-content/60 mt-1 truncate">
                        {connector.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </section>

        {/* AI ASSISTANT BANNER */}
        <section className="rounded-2xl overflow-hidden bg-base-100 border border-base-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">
                    Votre assistant Data IA
                  </h3>
                  <span className="badge badge-sm bg-violet-500/10 text-violet-500 border-0">
                    AI
                  </span>
                </div>

                <p className="text-sm text-base-content/60 max-w-xl">
                  Un résultat vous intrigue ? Demandez à AutoBI de vous
                  expliquer les chiffres, les tendances et les recommandations
                  de vos rapports générés.
                </p>
              </div>
            </div>

            <button
              onClick={handleAI}
              className="btn btn-outline border-violet-500/40 text-violet-500 hover:bg-violet-500 hover:border-violet-500 hover:text-white flex-shrink-0 gap-2"
            >
              <Sparkles size={17} />
              Poser une question
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* FOOTER SHORTCUTS */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-t border-base-300 pt-6">
          <div className="flex items-center gap-2 text-sm text-base-content/50">
            <Clock3 size={16} />
            <span>Vos données, vos analyses, vos décisions.</span>
          </div>

          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-success transition-colors"
          >
            <History size={17} />
            Consulter l'historique
            <ArrowUpRight size={15} />
          </button>
        </section>

      </div>
    </div>
  );
};

export default Home;
