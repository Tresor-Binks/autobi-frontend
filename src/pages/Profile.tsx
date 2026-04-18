/**
 * PAGE PROFIL — sobre, professionnel, utile
 */

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Calendar, CreditCard, Coins, Edit2,
  Check, X, Plus, AlertCircle, Info, ExternalLink,
  RefreshCw, Shield, Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// HELPERS
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

// ============================================================================
// SOUS-COMPOSANT : LIGNE D'INFO
// ============================================================================

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-base-200 last:border-0">
    <div className="flex items-center gap-2 text-base-content/50 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-sm font-medium text-base-content">{value}</span>
  </div>
);

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Sync si user change
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleRefreshTokens = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSaveError('Le prénom et le nom sont obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setSaveError('Adresse email invalide.');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: appel API PUT /auth/profile quand disponible
      await new Promise(r => setTimeout(r, 800));
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Erreur lors de la sauvegarde. Réessayez.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  };

  const tokenBalance = user?.token_balance ?? 0;
  const isLowTokens = tokenBalance <= 2;
  const planLabel = user?.plan_type === 'monthly_unlimited'
    ? 'Abonnement mensuel illimité'
    : 'Paiement par utilisation';

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* ---- EN-TÊTE ---- */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">Mon compte</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Gérez vos informations personnelles et votre solde
          </p>
        </div>

        {/* ---- SUCCÈS SAUVEGARDE ---- */}
        {saveSuccess && (
          <div className="alert alert-success py-2">
            <Check size={16} />
            <span className="text-sm">Profil mis à jour avec succès.</span>
          </div>
        )}

        {/* ================================================================
            SECTION 1 : INFORMATIONS PERSONNELLES
        ================================================================ */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">

            {/* En-tête section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-base-content/50" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
                  Informations personnelles
                </h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-ghost btn-xs gap-1.5 text-base-content/50 hover:text-base-content"
                >
                  <Edit2 size={13} />Modifier
                </button>
              )}
            </div>

            {!isEditing ? (
              /* ---- MODE LECTURE ---- */
              <div>
                <InfoRow
                  icon={<User size={14} />}
                  label="Nom complet"
                  value={`${user?.firstName || '—'} ${user?.lastName || ''}`}
                />
                <InfoRow
                  icon={<Mail size={14} />}
                  label="Email"
                  value={user?.email || '—'}
                />
                <InfoRow
                  icon={<Calendar size={14} />}
                  label="Membre depuis"
                  value={formatDate(user?.created_at)}
                />
                <InfoRow
                  icon={<Clock size={14} />}
                  label="Dernière connexion"
                  value={formatDate(user?.last_login)}
                />
              </div>
            ) : (
              /* ---- MODE ÉDITION ---- */
              <div className="space-y-3">
                {saveError && (
                  <div className="alert alert-error py-2 text-sm">
                    <AlertCircle size={14} />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Prénom</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className="input input-bordered input-sm"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Nom</span>
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      className="input input-bordered input-sm"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">Email</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input input-bordered input-sm"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-success btn-sm"
                  >
                    {isSaving
                      ? <><span className="loading loading-spinner loading-xs" />Enregistrement...</>
                      : <><Check size={14} />Enregistrer</>
                    }
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="btn btn-ghost btn-sm"
                  >
                    <X size={14} />Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================
            SECTION 2 : PLAN
        ================================================================ */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-base-content/50" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
                Plan
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{planLabel}</p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {user?.plan_type === 'monthly_unlimited'
                    ? 'Analyses illimitées incluses'
                    : 'Payez uniquement les analyses effectuées'}
                </p>
              </div>
              <span className="badge badge-success badge-sm">Actif</span>
            </div>

            {user?.plan_type !== 'monthly_unlimited' && (
              <div className="mt-4 pt-4 border-t border-base-200">
                <p className="text-xs text-base-content/50 mb-2">
                  Passez à l'abonnement mensuel pour des analyses illimitées.
                </p>
                <a
                  href="https://test.autoi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-xs gap-1.5"
                >
                  Voir les offres <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================
            SECTION 3 : JETONS
        ================================================================ */}
        <div className={`card border shadow-sm ${
          isLowTokens
            ? 'bg-warning/5 border-warning/30'
            : 'bg-base-100 border-base-300'
        }`}>
          <div className="card-body p-5">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins size={16} className={isLowTokens ? 'text-warning' : 'text-base-content/50'} />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
                  Jetons
                </h2>
              </div>
              <button
                onClick={handleRefreshTokens}
                disabled={isRefreshing}
                className="btn btn-ghost btn-xs gap-1.5 text-base-content/40 hover:text-base-content"
                title="Rafraîchir le solde"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                Actualiser
              </button>
            </div>

            {/* Solde principal */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-base-content">
                  {tokenBalance}
                  <span className="text-sm font-normal text-base-content/50 ml-1.5">
                    jeton{tokenBalance > 1 ? 's' : ''}
                  </span>
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">Solde disponible</p>
              </div>

              <a
                href="https://test.autoi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm gap-1.5"
              >
                <Plus size={14} />Acheter des jetons
              </a>
            </div>

            {/* Alerte solde faible */}
            {isLowTokens && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg mb-3">
                <AlertCircle size={14} className="text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Solde faible — rechargez pour continuer vos analyses sans interruption.
                </p>
              </div>
            )}

            {/* Explication tarification */}
            <div className="flex items-start gap-2 p-3 bg-base-200 rounded-lg">
              <Info size={13} className="text-base-content/40 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-base-content/50 leading-relaxed">
                Le coût d'une analyse dépend de la taille du fichier : 1 jeton pour ≤10 Ko,
                +1 jeton par tranche de 10 Ko supplémentaires.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================
            SECTION 4 : SÉCURITÉ
        ================================================================ */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-base-content/50" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
                Sécurité
              </h2>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Mot de passe</p>
                <p className="text-xs text-base-content/50 mt-0.5">Dernière modification inconnue</p>
              </div>
              <button className="btn btn-ghost btn-xs text-base-content/50">
                Modifier
              </button>
            </div>
          </div>
        </div>

        {/* ID compte */}
        <p className="text-center text-xs text-base-content/30 pb-4">
          Compte #{user?.id} · AutoBI
        </p>

      </div>
    </div>
  );
};