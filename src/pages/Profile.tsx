/**
 * PAGE PROFIL (React Frontend - AutoBI)
 * Affiche les informations personnelles, l'abonnement et la sécurité.
 * Affiche un aperçu flouté non scrollable + overlay de connexion centré si non authentifié.
 */

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Calendar, CreditCard, Coins, Edit2,
  Check, X, AlertCircle, RefreshCw, Shield, Clock, KeyRound, Lock, ExternalLink, LogIn
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLayoutContext } from '../layouts/MainLayout';

// URL racine du backend FastAPI
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ============================================================================
// HELPERS DE DATE & TEMPS RESTANT
// ============================================================================

function parseServerDate(dateString?: string | null): Date | null {
  if (!dateString) return null;
  const formattedStr = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
  const date = new Date(formattedStr);
  return isNaN(date.getTime()) ? null : date;
}

function formatDate(dateString?: string | null): string {
  const date = parseServerDate(dateString);
  if (!date) return '—';
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', 
    month: 'long', 
    year: 'numeric'
  });
}

function getSubscriptionRemaining(planExpiresAt?: string | null) {
  const endDate = parseServerDate(planExpiresAt);
  if (!endDate) return null;

  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { 
      expired: true, 
      endDate, 
      daysLeft: 0, 
      hoursLeft: 0, 
      text: 'Abonnement expiré' 
    };
  }

  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let text = '';
  if (daysLeft > 0) {
    text = `Reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`;
  } else {
    text = `Reste ${hoursLeft} heure${hoursLeft > 1 ? 's' : ''}`;
  }

  return { expired: false, endDate, daysLeft, hoursLeft, text };
}

// ============================================================================
// SOUS-COMPOSANT : LIGNE D'INFO
// ============================================================================

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-4 border-b border-base-200 last:border-0 min-w-0">
    <div className="flex items-center gap-3 text-base-content/60 min-w-0">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <span className="text-sm sm:text-base font-medium text-base-content break-words min-w-0">{value}</span>
  </div>
);

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const Profile: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { onRequestAuth } = useLayoutContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Mappage des propriétés
  const rawUser = (user as any) || {};
  const firstName = rawUser.firstName || rawUser.first_name || '';
  const lastName = rawUser.lastName || rawUser.last_name || '';
  const email = rawUser.email || '';
  
  // Normalisation du plan
  const rawPlanType = String(rawUser.plan_type || rawUser.planType || '').toLowerCase().trim();
  const isMonthlyUnlimited = rawPlanType === 'monthly_unlimited';
  
  const tokenBalance = rawUser.token_balance ?? rawUser.tokenBalance ?? 0;
  const createdAt = rawUser.created_at || rawUser.createdAt;
  const planExpiresAt = rawUser.plan_expires_at || rawUser.planExpiresAt || null;

  // Calcul d'expiration
  const subInfo = getSubscriptionRemaining(planExpiresAt);
  const isExpired = subInfo ? subInfo.expired : false;
  const isLowTokens = tokenBalance <= 2;

  // Nom complet
  const fullName = `${firstName} ${lastName}`.trim() || '—';

  const [form, setForm] = useState({ firstName, lastName, email });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    setForm({ firstName, lastName, email });
  }, [user, firstName, lastName, email]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  const handleRedirectToBilling = () => {
    window.open('https://autobi-app.com', '_blank', 'noopener,noreferrer');
  };

  // --- MISE À JOUR PROFIL ---
  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSaveError('Le prénom et le nom sont obligatoires.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
        }),
      });

      if (!response.ok) {
        let msg = 'Erreur lors de la mise à jour';
        try {
          const data = await response.json();
          if (data.detail) msg = data.detail;
        } catch {}
        throw new Error(msg);
      }

      await refreshUser();
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- CHANGEMENT DE MOT DE PASSE ---
  const handlePasswordSave = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordForm.currentPassword) {
      setPasswordError('Le mot de passe actuel est requis.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsPasswordSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      let data: any = {};
      const textResponse = await response.text();
      if (textResponse) {
        try { data = JSON.parse(textResponse); } catch {}
      }

      if (!response.ok) {
        throw new Error(data.detail || `Erreur serveur (${response.status})`);
      }

      setPasswordSuccess(true);
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // ============================================================================
  // RENDU : CONTENU DU PROFIL (UTILISÉ EN ARRIÈRE-PLAN OU DIRECTEMENT)
  // ============================================================================
  const renderProfileContent = () => (
    <div className="space-y-6">
      {saveSuccess && (
        <div className="alert alert-success shadow-sm">
          <Check size={20} />
          <span>Profil mis à jour avec succès.</span>
        </div>
      )}

      {/* SECTION 1 : INFORMATIONS PERSONNELLES */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <User size={22} className="text-success" />
              <h2 className="text-lg sm:text-xl font-semibold text-base-content leading-tight">Informations personnelles</h2>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-ghost btn-sm gap-2 min-h-10">
                <Edit2 size={16} />Modifier
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="divide-y divide-base-200">
              <InfoRow icon={<User size={18} />} label="Nom complet" value={fullName || 'Jean Dupont'} />
              <InfoRow icon={<Mail size={18} />} label="Email" value={email || 'jean.dupont@example.com'} />
              <InfoRow icon={<Calendar size={18} />} label="Membre depuis" value={formatDate(createdAt) !== '—' ? formatDate(createdAt) : '15 janvier 2025'} />
            </div>
          ) : (
            <div className="space-y-4">
              {saveError && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Prénom</span></label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="input input-bordered w-full"
                    disabled={isSaving}
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Nom</span></label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="input input-bordered w-full"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label flex justify-between">
                  <span className="label-text font-medium">Email</span>
                  <span className="label-text-alt text-gray-400">Non modifiable</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  className="input input-bordered w-full bg-base-200 cursor-not-allowed opacity-70"
                  disabled={true} 
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button onClick={handleSave} disabled={isSaving} className="btn btn-success w-full sm:w-auto min-h-11">
                  {isSaving ? <><span className="loading loading-spinner" />Enregistrement...</> : <><Check size={18} />Enregistrer</>}
                </button>
                <button onClick={() => { setIsEditing(false); setSaveError(null); }} disabled={isSaving} className="btn btn-ghost w-full sm:w-auto min-h-11">
                  <X size={18} />Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2 : ABONNEMENT */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <CreditCard size={22} className="text-success" />
              <h2 className="text-lg sm:text-xl font-semibold text-base-content leading-tight">Abonnement</h2>
            </div>
            <button onClick={handleRefresh} disabled={isRefreshing} className="btn btn-ghost btn-sm gap-2 text-base-content/60 min-h-10">
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />Actualiser
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-base sm:text-lg leading-snug break-words">
                {isMonthlyUnlimited ? 'Abonnement Mensuel Illimité' : 'Paiement à l’usage (Pay-As-You-Go)'}
              </p>
              <p className="text-sm text-base-content/60 mt-1 break-words">
                {isMonthlyUnlimited
                  ? 'Vous bénéficiez d’analyses illimitées sur l’ensemble de vos fichiers Excel.'
                  : 'Vous consommez des jetons à chaque analyse effectuée.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isMonthlyUnlimited ? (
                <span className={`badge ${isExpired ? 'badge-error' : 'badge-success'} badge-lg p-3 font-semibold`}>
                  {isExpired ? 'Abonnement expiré' : 'Actif'}
                </span>
              ) : (
                <span className="badge badge-ghost badge-lg p-3">Pay-As-You-Go</span>
              )}
            </div>
          </div>

          {isMonthlyUnlimited && planExpiresAt && (
            <div className="mt-6 pt-6 border-t border-base-200 space-y-4">
              {isExpired ? (
                <div className="alert alert-error bg-error/10 border-error/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={22} className="text-error shrink-0" />
                    <div>
                      <p className="font-bold text-error">Vous n'avez plus d'abonnement actif</p>
                      <p className="text-xs text-base-content/70 mt-0.5">
                        Votre période d'accès a expiré le {formatDate(planExpiresAt)}.
                      </p>
                    </div>
                  </div>
                  <button onClick={handleRedirectToBilling} className="btn btn-error btn-sm gap-2 shrink-0 min-h-10 w-full sm:w-auto">
                    Se réabonner <ExternalLink size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-base-200/50 rounded-xl">
                  <div>
                    <span className="text-xs text-base-content/50 uppercase font-semibold tracking-wider block break-words">
                      Date d'expiration / Renouvellement
                    </span>
                    <span className="text-base font-semibold text-base-content mt-1 block">
                      {formatDate(planExpiresAt)}
                    </span>
                  </div>

                  {subInfo && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Clock size={18} className="text-success" />
                      <span className="font-bold text-success break-words">
                        {subInfo.text}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3 : PORTEFEUILLE DE JETONS */}
      {!isMonthlyUnlimited && (
        <div className={`card border shadow-sm ${isLowTokens ? 'bg-warning/5 border-warning/30' : 'bg-base-100 border-base-300'}`}>
          <div className="card-body p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <Coins size={22} className={isLowTokens ? 'text-warning' : 'text-success'} />
                <h2 className="text-lg sm:text-xl font-semibold text-base-content leading-tight">Portefeuille de jetons</h2>
              </div>
              <button onClick={handleRefresh} disabled={isRefreshing} className="btn btn-ghost btn-sm gap-2 text-base-content/60 min-h-10">
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />Actualiser
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-base-content">{tokenBalance || 5}</span>
                  <span className="text-base sm:text-lg text-base-content/60">jetons disponibles</span>
                </div>
                <p className="text-sm text-base-content/60 mt-2">Utilisables pour l'ensemble de vos traitements analytiques.</p>
              </div>

              <button onClick={handleRedirectToBilling} className="btn btn-success gap-2 w-full sm:w-auto min-h-11">
                Acheter des crédits <ExternalLink size={16} />
              </button>
            </div>

            {isLowTokens && (
              <div className="alert alert-warning bg-warning/10 border-warning/20 text-sm mt-4">
                <AlertCircle size={18} />
                <span>Solde faible — rechargez votre compte pour continuer à générer des rapports.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4 : SÉCURITÉ */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6 min-w-0">
            <Shield size={22} className="text-success" />
            <h2 className="text-lg sm:text-xl font-semibold text-base-content leading-tight">Sécurité & Accès</h2>
          </div>

          {passwordSuccess && (
            <div className="alert alert-success shadow-sm mb-4">
              <Check size={20} />
              <span>Votre mot de passe a été modifié avec succès !</span>
            </div>
          )}

          {!isChangingPassword ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2">
              <div>
                <p className="font-medium">Mot de passe</p>
                <p className="text-sm text-base-content/60 mt-1 break-words">Gérez l'accès à votre compte</p>
              </div>
              <button onClick={() => setIsChangingPassword(true)} className="btn btn-outline btn-sm gap-2 min-h-10 w-full sm:w-auto">
                <KeyRound size={16} /> Modifiez votre mot de passe
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {passwordError && (
                <div className="alert alert-error text-sm">
                  <AlertCircle size={18} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Mot de passe actuel</span></label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  disabled={isPasswordSaving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Nouveau mot de passe</span></label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input input-bordered w-full"
                    placeholder="••••••••"
                    disabled={isPasswordSaving}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Confirmer le nouveau mot de passe</span></label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input input-bordered w-full"
                    placeholder="••••••••"
                    disabled={isPasswordSaving}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button onClick={handlePasswordSave} disabled={isPasswordSaving} className="btn btn-success w-full sm:w-auto min-h-11">
                  {isPasswordSaving ? <><span className="loading loading-spinner" />Mise à jour...</> : <><Lock size={18} />Mettre à jour le mot de passe</>}
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordError(null);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={isPasswordSaving}
                  className="btn btn-ghost"
                >
                  <X size={18} />Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ---- CAS NON AUTHENTIFIÉ (PLEINE HAUTEUR, SANS SCROLL, OVERLAY CENTRÉ) ----
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 h-[calc(100vh-5rem)] min-h-[500px] flex flex-col overflow-hidden">
        {/* En-tête */}

        {/* Zone relative occupant tout le reste de la hauteur sans scroll */}
        <div className="relative flex-1 overflow-hidden rounded-2xl">
          {/* Contenu flouté verrouillé en hauteur */}
          <div className="blur-sm opacity-50 pointer-events-none select-none h-full overflow-hidden">
            {renderProfileContent()}
          </div>

          {/* Overlay centré verticalement et horizontalement sur tout l'espace */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-base-100/90 backdrop-blur-md border border-base-300 rounded-2xl shadow-xl p-5 sm:p-8 text-center max-w-sm w-full">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-success/10 rounded-full mb-4">
                <LogIn className="text-success" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Connexion requise</h3>
              <p className="text-base-content/60 text-sm mb-6">
                Connectez-vous pour consulter et gérer les informations de votre profil.
              </p>
              <button onClick={onRequestAuth} className="btn btn-success w-full gap-2">
                <LogIn size={18} />Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- CAS AUTHENTIFIÉ (FLUX NORMAL AVEC SCROLL) ----
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      {renderProfileContent()}
    </div>
  );
};