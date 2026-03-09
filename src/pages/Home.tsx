/**
 * PAGE HOME - PAGE D'ACCUEIL
 * 
 * Cette page est la porte d'entrée de l'application.
 * Elle guide l'utilisateur, explique le fonctionnement et incite à l'action.
 * 
 * Structure :
 * 1. Hero - Introduction et CTA principal
 * 2. Préparation fichier Excel
 * 3. Bonnes pratiques d'analyse
 * 4. Fonctionnalités clés
 * 5. Dernières analyses
 * 6. Limites et fonctionnement
 * 7. Nouveautés
 * 8. CTA final
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  MessageSquare,
  BarChart3,
  History,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Données mockées des dernières analyses
   */
  const recentAnalyses = [
    { 
      id: 1, 
      filename: 'Ventes_Q4_2025.xlsx', 
      date: '2026-01-24', 
      status: 'Terminée' 
    },
    { 
      id: 2, 
      filename: 'Budget_Marketing.xlsx', 
      date: '2026-01-23', 
      status: 'Terminée' 
    },
    { 
      id: 3, 
      filename: 'Statistiques_RH.xlsx', 
      date: '2026-01-22', 
      status: 'Terminée' 
    },
  ];

  /**
   * Fonctionnalités principales de l'application
   */
  const features = [
    {
      icon: Zap,
      title: 'Analyse automatique',
      description: 'Détection automatique du schéma, types de données et statistiques descriptives'
    },
    {
      icon: Sparkles,
      title: 'Insights intelligents',
      description: 'Génération d\'observations clés et de recommandations basées sur vos données'
    },
    {
      icon: BarChart3,
      title: 'Visualisations',
      description: 'Graphiques automatiques pour mieux comprendre vos données'
    },
    {
      icon: MessageSquare,
      title: 'Questions IA',
      description: 'Posez des questions en langage naturel sur vos données analysées'
    },
    {
      icon: History,
      title: 'Historique complet',
      description: 'Conservez et consultez toutes vos analyses précédentes'
    },
    {
      icon: Shield,
      title: 'Confidentialité',
      description: 'Vos données sont traitées de manière sécurisée et confidentielle'
    }
  ];

  /**
   * Nouveautés récentes de l'application
   */
  const updates = [
    'Support amélioré des fichiers Excel avec formules complexes',
    'Nouveaux types de graphiques : nuages de points et histogrammes',
    'Interface IA plus rapide avec réponses contextuelles',
    'Export des résultats d\'analyse en PDF'
  ];

  return (
    <div className="min-h-screen bg-base-200">
      
      {/* Container principal pour le contenu */}
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">

        {/* ================================================================
            SECTION  : FONCTIONNALITÉS CLÉS
            ================================================================ */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Fonctionnalités clés</h2>
            <p className="text-base-content/70">
              Découvrez tout ce que vous pouvez faire avec AUTO BI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <feature.icon className="text-success mb-3" size={32} />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-base-content/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            SECTION  : BIEN PRÉPARER SON FICHIER EXCEL
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="text-success" size={28} />
                <h2 className="text-2xl font-semibold">
                  Comment bien préparer votre fichier Excel
                </h2>
              </div>

              <p className="text-base-content/70 mb-6">
                Pour une analyse optimale, assurez-vous que votre fichier respecte ces critères :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-base-200 rounded-md">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">Une seule feuille de calcul</h3>
                    <p className="text-sm text-base-content/70">
                      Le fichier ne doit contenir qu'une seule feuille active
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-200 rounded-md">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">Un tableau bien structuré</h3>
                    <p className="text-sm text-base-content/70">
                      Données organisées en lignes et colonnes cohérentes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-200 rounded-md">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">En-têtes clairs et explicites</h3>
                    <p className="text-sm text-base-content/70">
                      La première ligne doit contenir les noms de colonnes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-200 rounded-md">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">Pas de cellules fusionnées</h3>
                    <p className="text-sm text-base-content/70">
                      Évitez les fusions qui compliquent l'analyse
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-200 rounded-md">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">Formats de données cohérents</h3>
                    <p className="text-sm text-base-content/70">
                      Dates en format date, nombres en format nombre
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-200 rounded-md">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold mb-1">Taille maximale : 10 Mo</h3>
                    <p className="text-sm text-base-content/70">
                      Formats acceptés : .xlsx et .xls uniquement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION  : BONNES PRATIQUES D'ANALYSE
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-success" size={28} />
                <h2 className="text-2xl font-semibold">
                  Bonnes pratiques pour une analyse efficace
                </h2>
              </div>

              <p className="text-base-content/70 mb-6">
                Maximisez la valeur de vos analyses en suivant ces recommandations :
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border-l-4 border-success bg-success/5 rounded-r-md">
                  <span className="text-success font-bold text-lg">1.</span>
                  <div>
                    <h3 className="font-semibold">Vérifier les valeurs manquantes</h3>
                    <p className="text-sm text-base-content/70">
                      Identifiez les cellules vides et décidez comment les traiter avant l'analyse
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border-l-4 border-success bg-success/5 rounded-r-md">
                  <span className="text-success font-bold text-lg">2.</span>
                  <div>
                    <h3 className="font-semibold">Comparer les périodes temporelles</h3>
                    <p className="text-sm text-base-content/70">
                      Si vos données incluent des dates, analysez les évolutions dans le temps
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border-l-4 border-success bg-success/5 rounded-r-md">
                  <span className="text-success font-bold text-lg">3.</span>
                  <div>
                    <h3 className="font-semibold">Identifier les valeurs aberrantes</h3>
                    <p className="text-sm text-base-content/70">
                      Portez attention aux valeurs extrêmes qui peuvent fausser vos statistiques
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border-l-4 border-success bg-success/5 rounded-r-md">
                  <span className="text-success font-bold text-lg">4.</span>
                  <div>
                    <h3 className="font-semibold">Comprendre les unités de mesure</h3>
                    <p className="text-sm text-base-content/70">
                      Assurez-vous de bien interpréter les échelles et unités de vos données
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border-l-4 border-success bg-success/5 rounded-r-md">
                  <span className="text-success font-bold text-lg">5.</span>
                  <div>
                    <h3 className="font-semibold">Utiliser l'assistant IA pour approfondir</h3>
                    <p className="text-sm text-base-content/70">
                      Posez des questions spécifiques pour explorer vos données en profondeur
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ================================================================
            SECTION  : DERNIÈRES ANALYSES RÉCENTES
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="text-success" size={28} />
                  <h2 className="text-2xl font-semibold">Dernières analyses</h2>
                </div>
                <button 
                  onClick={() => navigate('/history')}
                  className="btn btn-ghost btn-sm"
                >
                  Voir l'historique complet
                </button>
              </div>

              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <History className="mx-auto mb-3 opacity-40" size={40} />
                  <p>Aucune analyse récente</p>
                  <p className="text-sm">Lancez votre première analyse pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className="flex items-center justify-between p-4 bg-base-200 rounded-md hover:bg-base-300 transition-colors cursor-pointer"
                      onClick={() => navigate('/history')}
                    >
                      <div className="flex items-center gap-4">
                        <FileSpreadsheet className="text-success" size={24} />
                        <div>
                          <h3 className="font-semibold">{analysis.filename}</h3>
                          <p className="text-sm text-base-content/60">
                            {new Date(analysis.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-success badge-sm">
                        {analysis.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION  : LIMITES & FONCTIONNEMENT
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-warning/30 shadow-sm">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="text-warning flex-shrink-0 mt-1" size={24} />
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Important : Fonctionnement et limites
                  </h2>
                  <div className="space-y-3 text-sm text-base-content/80">
                    <p>
                      <strong>Confidentialité et sécurité :</strong> Vos fichiers sont traités 
                      de manière sécurisée. Les données brutes ne sont pas stockées de façon permanente 
                      sur nos serveurs.
                    </p>
                    <p>
                      <strong>Durée de conservation :</strong> Les résultats d'analyse sont conservés 
                      dans votre historique, mais les fichiers Excel originaux ne sont pas stockés.
                    </p>
                    <p>
                      <strong>Nouvelles questions :</strong> Pour poser de nouvelles questions à l'IA 
                      sur vos données, vous devrez re-téléverser le fichier Excel. L'assistant IA 
                      nécessite l'accès aux données brutes pour répondre avec précision.
                    </p>
                    <p>
                      <strong>Export des résultats :</strong> Nous vous recommandons d'exporter 
                      vos insights importants pour une consultation ultérieure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION  : NOUVEAUTÉS
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-success" size={28} />
                <h2 className="text-2xl font-semibold">Nouveautés récentes</h2>
              </div>

              <p className="text-base-content/70 mb-4">
                Nous améliorons constamment Excel Analyzer. Voici les dernières fonctionnalités :
              </p>

              <ul className="space-y-2">
                {updates.map((update, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-success font-bold mt-0.5">✓</span>
                    <span className="text-sm">{update}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-md">
                <p className="text-sm text-base-content/80">
                  <strong>À venir prochainement :</strong> Comparaison entre plusieurs fichiers, 
                  détection automatique d'anomalies, et suggestions d'optimisation de données.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION  : CALL TO ACTION FINAL
            ================================================================ */}
        <section className="text-center py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à analyser vos données ?
            </h2>
            <p className="text-lg text-base-content/70 mb-8">
              Téléversez votre fichier Excel et obtenez des insights en quelques secondes. 
              Vos données restent confidentielles et sécurisées.
            </p>
            
            <button
              onClick={() => navigate('/analysis')}
              className="btn btn-success btn-l"
            >
              <Upload size={14} />
              Lancer une nouvelle analyse
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-base-content/60">
              <Shield size={16} />
              <span>Vos données sont traitées de manière sécurisée et confidentielle</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};