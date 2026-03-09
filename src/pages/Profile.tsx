/**
 * PAGE PROFILE - PROFIL UTILISATEUR
 * 
 * Cette page centralise toutes les informations du compte utilisateur :
 * - Informations personnelles (modifiables)
 * - Plan et facturation
 * - Solde et historique des tokens
 * - Informations générales du compte
 * 
 * ARCHITECTURE :
 * - Fonctionnement sans backend (données mockées)
 * - Prête pour intégration API backend
 * - Validation des formulaires
 * - Feedback utilisateur clair
 * 
 * SYSTÈME DE FACTURATION :
 * - Plan "Tokens" : Paiement à l'usage
 * - Plan "Mensuel" : Abonnement illimité
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Coins,
  Shield,
  Edit,
  Check,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Info,
  Crown,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type PlanType = 'tokens' | 'monthly';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationDate: string;
  lastLogin: string;
}

interface BillingPlan {
  type: PlanType;
  name: string;
  description: string;
  status: 'active' | 'expired' | 'cancelled';
  renewalDate?: string; // Pour abonnement mensuel
  price?: number;
}

interface TokenBalance {
  current: number;
  total: number; // Total acheté
}

interface TokenTransaction {
  id: string;
  type: 'purchase' | 'consumption';
  amount: number;
  date: string;
  description: string;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const Profile: React.FC = () => {

  // ============================================================================
  // RÉCUPÉRATION DE L'UTILISATEUR CONNECTÉ
  // ============================================================================
  
  const { user: currentUser } = useAuth(); // ← AJOUTER CETTE LIGNE

  // ============================================================================
  // ÉTAT LOCAL - DONNÉES MOCKÉES OU RÉELLES
  // ============================================================================

  /**
   * Informations utilisateur
   */
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: currentUser?.id.toString() || 'user_2024_abc123',
    firstName: currentUser?.firstName || 'Jean',
    lastName: currentUser?.lastName || 'Dupont',
    email: currentUser?.email || 'jean.dupont@example.com',
    registrationDate: currentUser?.created_at || '2024-01-15T10:30:00Z',
    lastLogin: currentUser?.last_login || '2026-01-26T08:45:00Z'
  });

  /**
   * Plan de facturation
   */
  const [billingPlan, setBillingPlan] = useState<BillingPlan>({
    type: currentUser?.plan_type === 'monthly_unlimited' ? 'monthly' : 'tokens',
    name: currentUser?.plan_type === 'monthly_unlimited' 
      ? 'Abonnement mensuel' 
      : 'Paiement par utilisation',
    description: currentUser?.plan_type === 'monthly_unlimited'
      ? 'Analyses illimitées pour un tarif mensuel fixe'
      : 'Payez uniquement pour les analyses que vous effectuez',
    status: 'active'
  });

  /**
   * Solde de tokens
   */
  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({
    current: currentUser?.token_balance || 75,
    total: 150
  });

  /**
   * Historique des tokens
   */
  const [tokenHistory, setTokenHistory] = useState<TokenTransaction[]>([
    {
      id: 'tx_1',
      type: 'purchase',
      amount: 100,
      date: '2024-01-20T14:00:00Z',
      description: 'Achat de tokens - Pack starter'
    },
    {
      id: 'tx_2',
      type: 'consumption',
      amount: -15,
      date: '2024-01-22T10:30:00Z',
      description: 'Analyse : ventes_2024.xlsx'
    },
    {
      id: 'tx_3',
      type: 'purchase',
      amount: 50,
      date: '2024-01-23T16:45:00Z',
      description: 'Achat de tokens - Pack mini'
    },
    {
      id: 'tx_4',
      type: 'consumption',
      amount: -10,
      date: '2024-01-25T09:15:00Z',
      description: 'Analyse : budget_marketing.xlsx'
    }
  ]);


  // ============================================================================
  // SYNCHRONISATION AVEC LE CONTEXT AUTH
  // ============================================================================

  useEffect(() => {
    if (currentUser) {
      setUserProfile({
        id: currentUser.id.toString(),
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        registrationDate: currentUser.created_at,
        lastLogin: currentUser.last_login || new Date().toISOString()
      });

      setBillingPlan({
        type: currentUser.plan_type === 'monthly_unlimited' ? 'monthly' : 'tokens',
        name: currentUser.plan_type === 'monthly_unlimited' 
          ? 'Abonnement mensuel' 
          : 'Paiement par utilisation',
        description: currentUser.plan_type === 'monthly_unlimited'
          ? 'Analyses illimitées pour un tarif mensuel fixe'
          : 'Payez uniquement pour les analyses que vous effectuez',
        status: 'active'
      });

      setTokenBalance(prev => ({
        ...prev,
        current: currentUser.token_balance
      }));
    }
  }, [currentUser]);


  /**
   * État d'édition du profil
   */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // HANDLERS - GESTION DU PROFIL
  // ============================================================================

  /**
   * Activer le mode édition
   */
  const handleStartEdit = () => {
    setEditedProfile(userProfile);
    setIsEditingProfile(true);
  };

  /**
   * Annuler l'édition
   */
  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditingProfile(false);
  };

  /**
   * Validation du formulaire
   */
  const validateProfile = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!editedProfile.firstName.trim()) {
      errors.push('Le prénom est obligatoire');
    }

    if (!editedProfile.lastName.trim()) {
      errors.push('Le nom est obligatoire');
    }

    if (!editedProfile.email.trim()) {
      errors.push('L\'email est obligatoire');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedProfile.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * Sauvegarde du profil
   */
  const handleSaveProfile = async () => {
    const validation = validateProfile();

    if (!validation.valid) {
      alert('Erreurs de validation :\n' + validation.errors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      /* BACKEND INTEGRATION:
      await axios.put('/api/user/profile', {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        email: editedProfile.email
      });
      */

      setUserProfile(editedProfile);
      setIsEditingProfile(false);
      alert('✅ Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Achat de tokens (placeholder)
   */
  const handleBuyTokens = () => {
    alert('Fonctionnalité d\'achat de tokens en cours de développement.\n\nProchainement : intégration avec un système de paiement sécurisé.');
    
    /* BACKEND INTEGRATION:
    navigate('/buy-tokens');
    ou
    await axios.post('/api/tokens/purchase', { packageId: 'pack_100' });
    */
  };

  /**
   * Changement de plan (placeholder)
   */
  const handleChangePlan = () => {
    alert('Fonctionnalité de changement de plan en cours de développement.\n\nProchainement : vous pourrez passer d\'un plan à l\'autre facilement.');
    
    /* BACKEND INTEGRATION:
    navigate('/billing/plans');
    ou
    await axios.post('/api/billing/change-plan', { planType: 'monthly' });
    */
  };

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  /**
   * Formater une date
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Calculer le pourcentage de tokens restants
   */
  const getTokenPercentage = (): number => {
    return (tokenBalance.current / tokenBalance.total) * 100;
  };

  /**
   * Couleur de la jauge de tokens
   */
  const getTokenColor = (): string => {
    const percentage = getTokenPercentage();
    if (percentage > 50) return 'progress-success';
    if (percentage > 20) return 'progress-warning';
    return 'progress-error';
  };

  // ============================================================================
  // RENDU
  // ============================================================================

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-5xl mx-auto">


        <div className="space-y-6">

          {/* ================================================================
              SECTION 1 : INFORMATIONS PERSONNELLES
              ================================================================ */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="text-success" size={28} />
                  <h2 className="text-2xl font-semibold">Informations personnelles</h2>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={handleStartEdit}
                    className="btn btn-outline btn-success btn-sm"
                  >
                    <Edit size={16} />
                    Modifier le profil
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                /* MODE LECTURE */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      <span className="label-text text-base-content/60">Prénom</span>
                    </label>
                    <p className="text-lg font-semibold">{userProfile.firstName}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text text-base-content/60">Nom</span>
                    </label>
                    <p className="text-lg font-semibold">{userProfile.lastName}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">
                      <span className="label-text text-base-content/60">Email</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-base-content/60" />
                      <p className="text-lg font-semibold">{userProfile.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE ÉDITION */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Prénom</span>
                      </label>
                      <input
                        type="text"
                        value={editedProfile.firstName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                        className="input input-bordered"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Nom</span>
                      </label>
                      <input
                        type="text"
                        value={editedProfile.lastName}
                        onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                        className="input input-bordered"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="input input-bordered"
                      placeholder="votre.email@example.com"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="btn btn-success"
                    >
                      {isSaving ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Enregistrer
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="btn btn-ghost"
                    >
                      <X size={18} />
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ================================================================
              SECTION 2 : PLAN ET FACTURATION
              ================================================================ */}
          <section className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-success" size={28} />
                <h2 className="text-2xl font-semibold">Plan et facturation</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan actuel */}
                <div className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Plan actuel</h3>
                    {billingPlan.type === 'tokens' ? (
                      <Zap className="text-success" size={24} />
                    ) : (
                      <Crown className="text-warning" size={24} />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-success">{billingPlan.name}</p>
                      <p className="text-sm text-base-content/70 mt-1">{billingPlan.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge ${billingPlan.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                        {billingPlan.status === 'active' ? 'Actif' : 'Expiré'}
                      </span>
                    </div>

                    {billingPlan.renewalDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        <span>Renouvellement : {formatDate(billingPlan.renewalDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alternative */}
                <div className="p-6 bg-base-200 border border-base-300 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Autres plans disponibles</h3>

                  {billingPlan.type === 'tokens' ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Crown className="text-warning flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-semibold">Abonnement mensuel</p>
                          <p className="text-sm text-base-content/70">Analyses illimitées pour 29€/mois</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Zap className="text-success flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-semibold">Paiement par utilisation</p>
                          <p className="text-sm text-base-content/70">Payez uniquement ce que vous consommez</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleChangePlan}
                    className="btn btn-outline btn-sm mt-4 w-full"
                  >
                    Changer de plan
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 3 : TOKENS (SI PLAN TOKENS)
              ================================================================ */}
          {billingPlan.type === 'tokens' && (
            <section className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Coins className="text-success" size={28} />
                    <h2 className="text-2xl font-semibold">Mes tokens</h2>
                  </div>

                  <button
                    onClick={handleBuyTokens}
                    className="btn btn-success btn-sm"
                  >
                    <Plus size={16} />
                    Acheter des tokens
                  </button>
                </div>

                {/* Solde actuel */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-base-content/60">Solde actuel</span>
                    <span className="text-2xl font-bold">
                      {tokenBalance.current} <span className="text-base-content/60 text-base">tokens</span>
                    </span>
                  </div>
                  <progress
                    className={`progress ${getTokenColor()} w-full`}
                    value={tokenBalance.current}
                    max={tokenBalance.total}
                  ></progress>
                  <div className="flex justify-between text-xs text-base-content/50 mt-1">
                    <span>0</span>
                    <span>{getTokenPercentage().toFixed(0)}% disponible</span>
                    <span>{tokenBalance.total}</span>
                  </div>
                </div>

                {/* Alerte si tokens faibles */}
                {getTokenPercentage() < 20 && (
                  <div className="alert alert-warning mb-6">
                    <AlertCircle />
                    <div>
                      <h4 className="font-semibold">Solde de tokens faible</h4>
                      <p className="text-sm">
                        Il vous reste seulement {tokenBalance.current} tokens. 
                        Pensez à recharger pour continuer vos analyses.
                      </p>
                    </div>
                  </div>
                )}

                {/* Explication */}
                <div className="alert border border-info/30 bg-info/5 mb-6">
                  <Info className="text-info flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm">
                      <strong>Comment ça fonctionne ?</strong><br />
                      Chaque analyse consomme des tokens selon la taille du fichier et la complexité demandée.
                      En moyenne : 10-20 tokens par analyse.
                    </p>
                  </div>
                </div>

                {/* Historique */}
                <div>
                  <h3 className="font-semibold mb-3">Historique des tokens</h3>
                  <div className="space-y-2">
                    {tokenHistory.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-base-200 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          {transaction.type === 'purchase' ? (
                            <TrendingUp className="text-success" size={18} />
                          ) : (
                            <TrendingDown className="text-error" size={18} />
                          )}
                          <div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            <p className="text-xs text-base-content/60">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${
                            transaction.type === 'purchase' ? 'text-success' : 'text-error'
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}


        </div>
      </div>
    </div>
  );
};