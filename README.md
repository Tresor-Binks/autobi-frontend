# AutoBI — Frontend

> Interface React + TypeScript pour l'analyse automatique de fichiers Excel/CSV par IA.  
> Wizard multi-étapes, dashboard interactif Chart.js, gestion des jetons, historique et chat IA.

---

## Stack technique

| Composant | Technologie |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Style | TailwindCSS + DaisyUI |
| Graphiques | Chart.js + react-chartjs-2 |
| État global | Zustand |
| Export PDF | react-to-print v3 |
| Icônes | lucide-react |

---

## Structure du projet

```
frontend/
├── src/
│   ├── api/
│   │   └── (fetch wrappers vers le backend)
│   ├── components/
│   │   └── (composants réutilisables)
│   ├── hooks/
│   │   └── useAuth.ts         # Accès à l'utilisateur connecté
│   ├── layouts/
│   │   └── MainLayout.tsx     # Layout avec TopBar + Sidebar
│   ├── pages/
│   │   ├── Analysis/          # Wizard d'analyse complet
│   │   │   ├── Analysis.tsx           # Orchestrateur du wizard
│   │   │   ├── api/
│   │   │   │   └── analysisApi.ts     # Tous les appels API analyse
│   │   │   └── steps/
│   │   │       ├── FileUploadStep.tsx     # Étape 1 — sélection fichier
│   │   │       ├── PreAnalysisStep.tsx    # Étape 2 — upload + IA
│   │   │       ├── InsightSelectionStep.tsx # Étape 3 — sélection insights
│   │   │       ├── ReviewStep.tsx         # Étape 4 — confirmation + jetons
│   │   │       └── ProcessingStep.tsx     # Étape 5 — suivi + résultat
│   │   ├── Dashboard.tsx      # Dashboard interactif + export PDF
│   │   ├── History.tsx        # Historique des analyses
│   │   ├── AI.tsx             # Chat IA sur une analyse
│   │   ├── Profile.tsx        # Profil utilisateur
│   │   └── Landing/           # Landing page (Next.js séparé)
│   ├── store/
│   │   └── notifications.ts   # Store Zustand — notifications toast
│   └── main.tsx
├── .env
└── vite.config.ts
```

---

## Variables d'environnement (.env)

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## Pages et fonctionnalités

---

### 🏠 Landing Page
Page publique de présentation du produit. Contient le formulaire d'inscription/connexion et l'intégration du paiement OpenPay pour l'achat de jetons.

---

### 📊 Page Analyse — Wizard 5 étapes (`/analysis`)

Orchestrée par `Analysis.tsx` qui gère le state global du wizard et passe les données entre les étapes.

---

#### Étape 1 — Sélection du fichier (`FileUploadStep.tsx`)

- Drag & drop ou sélection via explorateur de fichiers
- Formats acceptés : `.xlsx`, `.xls`, `.csv` (max 10 Mo)
- Appelle `POST /analysis/validate` immédiatement à la sélection
- Affiche les erreurs de validation (format, taille, structure)
- Si l'utilisateur n'est pas connecté : overlay avec bouton de connexion
- En cas de fichier valide → passage automatique à l'étape 2

---

#### Étape 2 — Upload & Analyse IA (`PreAnalysisStep.tsx`)

- Appelle `POST /analysis/upload` qui fait **tout en une fois** :
  - Conversion Excel → JSON
  - Calcul des statistiques
  - Appel GPT-4o-mini pour générer les suggestions d'insights
- Affichage d'un spinner **en deux phases** :
  - Phase 1 (1.5s) : "Lecture du fichier..."
  - Phase 2 : "Analyse IA en cours... (peut prendre jusqu'à 1 minute)"
- En cas d'erreur timeout (3 min) → message clair + bouton "Réessayer"
- En cas de succès → affiche le résumé IA + nombre d'insights générés + tableau des colonnes détectées
- Passage automatique à l'étape 3

---

#### Étape 3 — Sélection des insights (`InsightSelectionStep.tsx`)

Les insights sont **déjà disponibles** (générés à l'étape 2) — aucun polling, affichage immédiat.

**Fonctionnalités :**
- Affichage des 4-6 suggestions GPT-4o-mini avec type, faisabilité et colonnes requises
- Sélection multiple par clic sur la carte (toggle)
- Limite : **6 insights maximum**
- Badge "Générés par GPT-4o-mini" sur chaque suggestion
- Résumé IA affiché en haut (description générale du dataset)
- **Insight personnalisé** : l'utilisateur peut écrire sa demande en langage naturel
  - Appelle `POST /analysis/validate-insight` pour vérification IA
  - Si valide → reformulation automatique + ajout à la liste
  - Si invalide → message d'explication
  - Si erreur réseau → message neutre (pas de blocage)
- Panel récapitulatif des insights sélectionnés avec bouton de suppression
- Bouton "Continuer" désactivé si 0 insight sélectionné + compteur affiché

---

#### Étape 4 — Révision et confirmation (`ReviewStep.tsx`)

Récapitulatif complet avant de consommer les jetons :

- **Fichier** : nom, taille, nombre de feuilles, statut valide
- **Colonnes** : liste avec type détecté (text / number / date / boolean)
- **Insights sélectionnés** : liste numérotée avec titre et description
- **Coût en jetons** : calculé depuis la taille du fichier (`ceil(Ko/10)`, min 1)
- **Solde utilisateur** : affiché avec le solde restant après analyse
- Si solde insuffisant → alerte rouge + bouton "Acheter des jetons" (lien externe OpenPay)
- Bouton "Lancer l'analyse" → appelle `POST /analysis/{id}/confirm`

---

#### Étape 5 — Traitement et suivi (`ProcessingStep.tsx`)

- Poll `GET /analysis/{id}` toutes les secondes
- Barre de progression visuelle avec étapes (Chargement → Analyse → Graphiques → Finalisation)
- Quand `status === "completed"` → notification toast + bouton "Accéder au dashboard"
- Quand `status === "failed"` → notification d'échec

---

### 📈 Dashboard (`/dashboard/:analysisId`)

Dashboard interactif qui affiche le rapport JSON généré par GPT-4o-mini.

#### Navbar fixe
- Bouton retour vers l'historique
- Titre du rapport (depuis `summary.title`)
- Badge "IA" vert
- Bouton "Rafraîchir" (recharge les données)
- Bouton "PDF" → export via react-to-print

#### Résumé IA
- Titre accrocheur du rapport
- Paragraphe de 4-6 phrases (contexte, découvertes, recommandations)
- Key takeaways : liste des 3 points clés avec chiffres précis

#### KPIs (`kpis[]`)
Cartes métriques avec :
- Icône contextuelle (euro, percent, users, trending-up, target, clock, etc.)
- Label en majuscules
- Valeur formatée (1 761 / 146.6K / 12.35)
- Unité affichée **seulement si elle n'est pas déjà dans la valeur** (pas de doublon)
- Badge trend : ↑ vert / ↓ rouge / — stable avec valeur comparative
- Description courte

**Types de graphiques supportés :**

| Type | Usage |
|---|---|
| `bar` | Comparaison entre catégories |
| `line` | Évolution temporelle |
| `pie` | Répartition en parts (max 5 catégories) |
| `doughnut` | Répartition en parts (max 6 catégories) |
| `scatter` | Corrélation entre 2 variables numériques |

Chaque graphique affiche :
- Icône du type + titre
- Badge "insight clé" vert (la conclusion actionnable en 1 phrase)
- Graphique Chart.js à 280px de hauteur
- Section déroulante "Analyse détaillée" avec description analytique complète

#### Insights détaillés (`insights[]`)
Cartes colorées avec bordure gauche :
- Titre + valeur principale chiffrée
- Description détaillée
- Section "→ Recommandation" avec l'action concrète à mener

#### Export PDF
- Utilise `react-to-print v3` avec `contentRef`
- Capture tout le rapport (résumé + KPIs + graphiques + insights)
- Format A4 avec marges 8mm
- Couleurs préservées (`print-color-adjust: exact`)

---

### 📁 Historique (`/history`)

- Liste toutes les analyses de l'utilisateur (ordre antéchronologique)
- Statuts colorés : COMPLETED (vert) / PROCESSING (bleu) / FAILED (rouge) / PENDING (gris)
- Clic sur une analyse terminée → ouvre le dashboard
- Informations : nom du fichier, date, jetons consommés, statut

---

### 🤖 Page IA (`/ai`)

Chat en langage naturel sur une analyse sélectionnée.
- Sélection de l'analyse dans un menu
- Appelle `POST /analysis/{id}/ask`
- Historique de conversation dans la session
- Réponses contextualisées avec les données du rapport (KPIs, insights, résumé)

---

### 👤 Profil (`/profile`)

- Informations personnelles (prénom, nom, email)
- Solde de jetons actuel
- Type de plan
- Historique des transactions (achats + consommations)

---

## `analysisApi.ts` — Service API centralisé

Classe singleton `AnalysisApiService` qui gère tout le cycle de vie d'une analyse.

```typescript
analysisApi.validateFile(file)           // POST /analysis/validate
analysisApi.preAnalyzeFile(file)         // POST /analysis/upload → stocke insights en cache
analysisApi.suggestInsights(columns)     // Lecture du cache (ZÉRO appel réseau)
analysisApi.validateCustomInsight(text)  // POST /analysis/validate-insight
analysisApi.validateInsight(text, cols)  // Validation locale légère (garde-fou UI)
analysisApi.runAnalysis(file, insights)  // POST /analysis/{id}/confirm
analysisApi.getAnalysisProgress(id)      // GET /analysis/{id}
analysisApi.getAiSummary()              // Lecture du résumé IA en cache
analysisApi.reset()                     // Réinitialise le cache (nouveau wizard)
```

**Cache interne :**
```typescript
private currentAnalysisId: number | null    // ID de l'analyse en cours
private cachedInsights: SuggestedInsight[]  // Insights générés lors de l'upload
private cachedAiSummary: string             // Résumé IA de l'upload
```

Les insights sont mis en cache lors de `preAnalyzeFile()` → `suggestInsights()` les retourne instantanément sans appel réseau. C'est pourquoi l'étape 3 est **immédiate**.

---

## Store Zustand — Notifications

```typescript
// notifications.ts
notifyAnalysisComplete(fileName, analysisId)  // Toast succès + lien dashboard
notifyAnalysisFailed(fileName)                // Toast erreur
```

Les notifications persistent entre les pages et disparaissent après lecture.

---

## Palette Chart.js

10 couleurs cohérentes utilisées dans tous les graphiques :

```
Vert      rgba(16,185,129,0.8)
Bleu      rgba(59,130,246,0.8)
Amber     rgba(245,158,11,0.8)
Violet    rgba(139,92,246,0.8)
Rose      rgba(236,72,153,0.8)
Teal      rgba(20,184,166,0.8)
Orange    rgba(249,115,22,0.8)
Indigo    rgba(99,102,241,0.8)
Green     rgba(34,197,94,0.8)
Red       rgba(239,68,68,0.8)
```

---

## Formatage des nombres

```typescript
formatNumber(1234567)  // → "1.2M"
formatNumber(146650)   // → "146.7K"
formatNumber(12.35)    // → "12,35"
formatNumber(200)      // → "200"
```

---

## Calcul du coût en jetons (identique au backend)

```typescript
function calculateTokenCost(fileSizeBytes: number): number {
  const sizeKo = fileSizeBytes / 1024;
  if (sizeKo <= 10) return 1;
  return Math.ceil(sizeKo / 10);
}
```

---

## Lancement

```bash
# Installation
npm install

# Développement
npm run dev
# → http://localhost:5173

# Production
npm run build
npm run preview
```

---

## Variables Vite importantes

| Variable | Valeur par défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000` | URL du backend FastAPI |

---

## Authentification côté frontend

Le token JWT est stocké dans `localStorage` sous la clé `auth_token`.

```typescript
// Lecture automatique dans tous les appels API
const token = localStorage.getItem('auth_token');
headers: { Authorization: `Bearer ${token}` }
```

Le hook `useAuth()` expose :
- `user` : profil complet de l'utilisateur connecté
- `isAuthenticated` : boolean
- `refreshUser()` : recharge le profil depuis `/auth/me`

---

## Points d'attention

- **Pas de polling pour les insights** : ils sont générés pendant l'upload et mis en cache → affichage instantané à l'étape 3
- **Pas de rollback de jetons** : une analyse qui échoue ne rembourse pas les jetons
- **Timeout IA** : si GPT-4o-mini ne répond pas en 3 minutes → HTTP 504 → message clair à l'utilisateur avec bouton "Réessayer"
- **Doublon d'unité** : le Dashboard vérifie que `unit` n'est pas déjà présent dans `value` avant de l'afficher
- **Devise** : FCFA par défaut si aucune devise n'est détectée dans les données du fichier uploadé