/**
 * PAGE HELP - CENTRE D'AIDE
 * 
 * Cette page fournit une documentation complète pour guider les utilisateurs
 * dans l'utilisation optimale de l'application Excel Analyzer.
 * 
 * STRUCTURE :
 * 1. Introduction et présentation
 * 2. Préparation correcte d'un fichier Excel
 * 3. Erreurs fréquentes à éviter
 * 4. Déroulement d'une analyse
 * 5. FAQ (Questions fréquentes)
 * 6. Support et contact
 */

import React from 'react';
import { 
  HelpCircle, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Upload,
  Eye,
  Sparkles,
  BarChart3,
  Mail,
  Book,
  Lightbulb,
  Shield,
  Clock
} from 'lucide-react';

/**
 * Interface pour les éléments de bonnes pratiques
 */
interface BestPractice {
  icon: React.ReactNode;
  title: string;
  description: string;
  isGood: boolean;
}

/**
 * Interface pour les questions de la FAQ
 */
interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Interface pour les étapes d'analyse
 */
interface AnalysisStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const Help: React.FC = () => {
  /**
   * BONNES PRATIQUES POUR PRÉPARER UN FICHIER EXCEL
   */
  const preparationSteps: BestPractice[] = [
    {
      icon: <CheckCircle2 className="text-success" size={24} />,
      title: 'Une seule feuille de calcul',
      description: 'Votre fichier Excel doit contenir une seule feuille active avec vos données.',
      isGood: true,
    },
    {
      icon: <CheckCircle2 className="text-success" size={24} />,
      title: 'Une ligne = un enregistrement',
      description: 'Chaque ligne représente une observation (client, vente, produit, etc.).',
      isGood: true,
    },
    {
      icon: <CheckCircle2 className="text-success" size={24} />,
      title: 'Première ligne = en-têtes',
      description: 'La première ligne doit contenir les noms de colonnes clairs et explicites.',
      isGood: true,
    },
    {
      icon: <CheckCircle2 className="text-success" size={24} />,
      title: 'Pas de cellules fusionnées',
      description: 'Évitez les fusions de cellules qui compliquent l\'analyse automatique.',
      isGood: true,
    },
    {
      icon: <CheckCircle2 className="text-success" size={24} />,
      title: 'Pas de lignes ou colonnes vides',
      description: 'Supprimez les espaces inutiles entre vos données pour une structure propre.',
      isGood: true,
    },
    {
      icon: <CheckCircle2 className="text-success" size={24} />,
      title: 'Formats cohérents',
      description: 'Dates en format date, nombres en format nombre, texte en format texte.',
      isGood: true,
    },
  ];

  /**
   * ERREURS FRÉQUENTES À ÉVITER
   */
  const commonMistakes: BestPractice[] = [
    {
      icon: <XCircle className="text-error" size={24} />,
      title: 'Colonnes avec types mélangés',
      description: 'Ne mélangez pas texte et chiffres dans une même colonne (ex: "100", "cent", "150").',
      isGood: false,
    },
    {
      icon: <XCircle className="text-error" size={24} />,
      title: 'Dates mal formatées',
      description: 'Utilisez un format de date cohérent (JJ/MM/AAAA ou AAAA-MM-JJ), pas de texte libre.',
      isGood: false,
    },
    {
      icon: <XCircle className="text-error" size={24} />,
      title: 'Totaux inclus dans les données',
      description: 'Les lignes de total ou de sous-total doivent être supprimées avant l\'analyse.',
      isGood: false,
    },
    {
      icon: <XCircle className="text-error" size={24} />,
      title: 'Formules complexes',
      description: 'Convertissez les formules en valeurs brutes pour éviter les erreurs de calcul.',
      isGood: false,
    },
    {
      icon: <XCircle className="text-error" size={24} />,
      title: 'Caractères spéciaux dans les en-têtes',
      description: 'Évitez les symboles (#, %, &) dans les noms de colonnes. Préférez le texte simple.',
      isGood: false,
    },
  ];

  /**
   * ÉTAPES DU DÉROULEMENT D'UNE ANALYSE
   */
  const analysisSteps: AnalysisStep[] = [
    {
      step: 1,
      title: 'Import du fichier',
      description: 'Vous téléversez votre fichier Excel (.xlsx ou .xls). Le système vérifie sa validité et sa taille.',
      icon: <Upload className="text-success" size={28} />,
    },
    {
      step: 2,
      title: 'Détection automatique des colonnes',
      description: 'L\'application identifie automatiquement le type de chaque colonne (texte, nombre, date) et génère le schéma.',
      icon: <Eye className="text-success" size={28} />,
    },
    {
      step: 3,
      title: 'Calcul des statistiques',
      description: 'Pour chaque colonne numérique, calcul de la moyenne, médiane, minimum, maximum et autres indicateurs.',
      icon: <Sparkles className="text-success" size={28} />,
    },
    {
      step: 4,
      title: 'Génération d\'insights',
      description: 'L\'IA analyse vos données et propose des observations clés : tendances, anomalies, recommandations.',
      icon: <Lightbulb className="text-success" size={28} />,
    },
    {
      step: 5,
      title: 'Création de graphiques',
      description: 'Génération automatique de visualisations adaptées à vos données pour faciliter la compréhension.',
      icon: <BarChart3 className="text-success" size={28} />,
    },
  ];

  /**
   * QUESTIONS FRÉQUENTES (FAQ)
   */
  const faqItems: FAQItem[] = [
    {
      question: 'Mes données sont-elles sauvegardées de manière permanente ?',
      answer: 'Non. Vos fichiers Excel ne sont pas stockés de façon permanente sur nos serveurs. Seuls les résultats d\'analyse (statistiques, insights) sont conservés dans votre historique. Pour garantir votre confidentialité, les données brutes sont supprimées après traitement.',
    },
    {
      question: 'Quels types de fichiers sont acceptés ?',
      answer: 'Nous acceptons uniquement les fichiers Excel au format .xlsx et .xls. La taille maximale autorisée est de 10 Mo. Le fichier doit contenir une seule feuille de calcul avec un tableau structuré.',
    },
    {
      question: 'Pourquoi mon fichier est-il refusé ?',
      answer: 'Plusieurs raisons possibles : fichier trop volumineux (> 10 Mo), format non supporté, plusieurs feuilles actives, structure trop complexe (cellules fusionnées, formules imbriquées), ou absence d\'en-têtes clairs en première ligne.',
    },
    {
      question: 'Puis-je analyser plusieurs fichiers en même temps ?',
      answer: 'Non, l\'analyse se fait fichier par fichier. Cependant, vous pouvez conserver plusieurs analyses dans votre historique et naviguer entre elles facilement.',
    },
    {
      question: 'Comment fonctionne l\'assistant IA ?',
      answer: 'L\'assistant IA vous permet de poser des questions en langage naturel sur une analyse spécifique. Il se base uniquement sur les données du fichier sélectionné pour vous répondre. Pour utiliser l\'IA, vous devez d\'abord sélectionner une analyse existante.',
    },
    {
      question: 'Les graphiques sont-ils exportables ?',
      answer: 'Cette fonctionnalité est en cours de développement. Prochainement, vous pourrez exporter vos résultats d\'analyse en PDF avec les graphiques et insights générés.',
    },
    {
      question: 'Que faire si l\'analyse échoue ?',
      answer: 'Vérifiez d\'abord que votre fichier respecte les bonnes pratiques (voir section "Préparer un fichier Excel"). Si le problème persiste, essayez de simplifier votre fichier : supprimez les formules, convertissez en valeurs, et assurez-vous d\'avoir une structure en tableau simple.',
    },
    {
      question: 'Combien de temps sont conservées mes analyses ?',
      answer: 'Vos analyses sont conservées dans votre historique sans limite de temps tant que vous utilisez l\'application. Vous pouvez les consulter à tout moment depuis la page Historique.',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">

      {/* Container principal */}
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">


        {/* ================================================================
            SECTION  : SUPPORT ET CONTACT
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-success" size={32} />
                <h2 className="text-2xl font-semibold">Support et contact</h2>
              </div>

              <div className="space-y-4">
                <p className="text-base-content/70">
                  Vous n'avez pas trouvé la réponse à votre question ? Notre équipe de
                  support est là pour vous aider.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email support */}
                  <div className="p-4 bg-base-200 rounded-lg border border-base-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="text-success" size={24} />
                      <h3 className="font-semibold">Email</h3>
                    </div>
                    <p className="text-sm text-base-content/70 mb-2">
                      Pour toute question technique ou commerciale
                    </p>
                    <a>
                      contact@artiode-congo.com
                    </a>
                  </div>

                  {/* Documentation */}
                  <div className="p-4 bg-base-200 rounded-lg border border-base-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Book className="text-success" size={24} />
                      <h3 className="font-semibold">Documentation</h3>
                    </div>
                    <p className="text-sm text-base-content/70 mb-2">
                      Guides détaillés et tutoriels vidéo
                    </p>
                    <span className="text-sm text-base-content/50 italic">
                      Disponible prochainement
                    </span>
                  </div>
                </div>

                <div className="alert border border-success/30 bg-success/5">
                  <Shield className="text-success flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold">Engagement de confidentialité</h4>
                    <p className="text-sm">
                      Vos données sont traitées avec le plus grand soin. Nous ne partageons
                      jamais vos informations avec des tiers et respectons strictement les
                      réglementations en vigueur (RGPD).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ================================================================
            SECTION 2 : COMMENT PRÉPARER UN FICHIER EXCEL
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="text-success" size={32} />
                <h2 className="text-2xl font-semibold">
                  Comment préparer un fichier Excel correctement
                </h2>
              </div>

              <p className="text-base-content/70 mb-6">
                Pour garantir une analyse optimale et éviter les erreurs, votre fichier
                Excel doit respecter certaines règles de structuration. Voici les bonnes
                pratiques à suivre :
              </p>

              <div className="space-y-3">
                {preparationSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-success/5 border border-success/20 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">{step.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-base-content/70">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-base-200 rounded-lg border border-base-300">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-info flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold mb-1">Astuce professionnelle</h4>
                    <p className="text-sm text-base-content/70">
                      Avant d'importer votre fichier, faites une copie et nettoyez-la :
                      supprimez les lignes de titre, les notes, les totaux et les mises en
                      forme complexes. Gardez uniquement le tableau de données brutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 3 : ERREURS FRÉQUENTES À ÉVITER
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-warning" size={32} />
                <h2 className="text-2xl font-semibold">
                  Erreurs fréquentes à éviter
                </h2>
              </div>

              <p className="text-base-content/70 mb-6">
                Ces erreurs sont les plus courantes et peuvent empêcher l'analyse de
                fonctionner correctement ou fausser les résultats. Vérifiez bien ces points
                avant d'importer votre fichier :
              </p>

              <div className="space-y-3">
                {commonMistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-error/5 border border-error/20 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">{mistake.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-1">{mistake.title}</h3>
                      <p className="text-sm text-base-content/70">{mistake.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 alert alert-warning">
                <AlertTriangle className="flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold">Attention particulière</h4>
                  <p className="text-sm">
                    Les erreurs ci-dessus sont responsables de 80% des échecs d'analyse.
                    Prenez le temps de vérifier votre fichier avant de le téléverser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4 : DÉROULEMENT D'UNE ANALYSE
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-success" size={32} />
                <h2 className="text-2xl font-semibold">
                  Comment se déroule une analyse
                </h2>
              </div>

              <p className="text-base-content/70 mb-8">
                Voici les différentes étapes automatiques qui se déroulent lorsque vous
                lancez une analyse de fichier Excel :
              </p>

              <div className="space-y-6">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Numéro de l'étape */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-success/10 border-2 border-success flex items-center justify-center">
                        <span className="text-xl font-bold text-success">{step.step}</span>
                      </div>
                      {index < analysisSteps.length - 1 && (
                        <div className="w-0.5 h-12 bg-success/30 mx-auto mt-2"></div>
                      )}
                    </div>

                    {/* Contenu de l'étape */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        {step.icon}
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-sm text-base-content/70">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-success flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold mb-1">Durée moyenne d'analyse</h4>
                    <p className="text-sm text-base-content/70">
                      Une analyse complète prend généralement entre 10 et 30 secondes selon
                      la taille de votre fichier. Vous pouvez suivre la progression en temps
                      réel sur la page d'analyse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 5 : FAQ (QUESTIONS FRÉQUENTES)
            ================================================================ */}
        <section>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="text-success" size={32} />
                <h2 className="text-2xl font-semibold">Questions fréquentes (FAQ)</h2>
              </div>

              <p className="text-base-content/70 mb-6">
                Vous trouverez ici les réponses aux questions les plus courantes sur
                l'utilisation d'Excel Analyzer.
              </p>

              <div className="space-y-2">
                {faqItems.map((item, index) => (
                  <div key={index} className="collapse collapse-plus bg-base-200 border border-base-300">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-semibold">
                      {item.question}
                    </div>
                    <div className="collapse-content">
                      <p className="text-sm text-base-content/80 pt-2">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};