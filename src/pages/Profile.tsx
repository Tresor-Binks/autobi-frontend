/**
 * PAGE PROFIL 
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
  <div className="flex items-center justify-between py-4 border-b border-base-200 last:border-0">
    <div className="flex items-center gap-3 text-base-content/60">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <span className="text-base font-medium text-base-content">{value}</span>
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
    <div className="p-8 max-w-4xl mx-auto">

      <div className="space-y-6">

        {/* ---- SUCCÈS SAUVEGARDE ---- */}
        {saveSuccess && (
          <div className="alert alert-success shadow-sm">
            <Check size={20} />
            <span>Profil mis à jour avec succès.</span>
          </div>
        )}

        {/* ================================================================
            SECTION 1 : INFORMATIONS PERSONNELLES
        ================================================================ */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            
            {/* En-tête section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User size={22} className="text-success" />
                <h2 className="text-xl font-semibold text-base-content">
                  Informations personnelles
                </h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-ghost btn-sm gap-2"
                >
                  <Edit2 size={16} />Modifier
                </button>
              )}
            </div>

            {!isEditing ? (
              /* ---- MODE LECTURE ---- */
              <div className="divide-y divide-base-200">
                <InfoRow
                  icon={<User size={18} />}
                  label="Nom complet"
                  value={`${user?.firstName || '—'} ${user?.lastName || ''}`}
                />
                <InfoRow
                  icon={<Mail size={18} />}
                  label="Email"
                  value={user?.email || '—'}
                />
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Membre depuis"
                  value={formatDate(user?.created_at)}
                />
                <InfoRow
                  icon={<Clock size={18} />}
                  label="Dernière connexion"
                  value={formatDate(user?.last_login)}
                />
              </div>
            ) : (
              /* ---- MODE ÉDITION ---- */
              <div className="space-y-4">
                {saveError && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Prénom</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className="input input-bordered w-full"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Nom</span>
                    </label>
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
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input input-bordered w-full"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-success"
                  >
                    {isSaving
                      ? <><span className="loading loading-spinner" />Enregistrement...</>
                      : <><Check size={18} />Enregistrer</>
                    }
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="btn btn-ghost"
                  >
                    <X size={18} />Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================
            SECTION 2 : PLAN & ABONNEMENT
        ================================================================ */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={22} className="text-success" />
              <h2 className="text-xl font-semibold text-base-content">Abonnement</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{planLabel}</p>
                <p className="text-sm text-base-content/60 mt-1">
                  {user?.plan_type === 'monthly_unlimited'
                    ? 'Vous bénéficiez d’analyses illimitées chaque mois.'
                    : 'Vous payez à l’usage selon les crédits disponibles.'}
                </p>
              </div>
              <span className="badge badge-success badge-lg p-3">Actif</span>
            </div>

            {user?.plan_type !== 'monthly_unlimited' && (
              <div className="mt-6 pt-6 border-t border-base-200">
                <p className="text-sm text-base-content/70 mb-4">
                  Passez à l'abonnement mensuel pour supprimer les limites d'analyse et accéder à plus de fonctionnalités.
                </p>
                <a
                  href="https://test.autoi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm gap-2"
                >
                  Découvrir les offres <ExternalLink size={14} />
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
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Coins size={22} className={isLowTokens ? 'text-warning' : 'text-success'} />
                <h2 className="text-xl font-semibold text-base-content">Portefeuille de jetons</h2>
              </div>
              <button
                onClick={handleRefreshTokens}
                disabled={isRefreshing}
                className="btn btn-ghost btn-sm gap-2 text-base-content/60"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Actualiser
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-base-content">{tokenBalance}</span>
                  <span className="text-lg text-base-content/60">jetons disponibles</span>
                </div>
                <p className="text-sm text-base-content/60 mt-2">Utilisables pour toutes vos analyses de fichiers Excel.</p>
              </div>

              <a
                href="https://test.autoi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success gap-2"
              >
                <Plus size={18} />Recharger le solde
              </a>
            </div>

            {/* Alertes et Info */}
            <div className="space-y-3 mt-6">
              {isLowTokens && (
                <div className="alert alert-warning bg-warning/10 border-warning/20 text-sm">
                  <AlertCircle size={18} />
                  <span>Solde faible — rechargez bientôt pour éviter toute interruption.</span>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-xl">
                <Info size={18} className="text-info mt-0.5 flex-shrink-0" />
                <p className="text-sm text-base-content/70 leading-relaxed">
                  <strong>Tarification :</strong> 1 jeton pour un fichier ≤ 10 Ko. 
                  Au-delà, +1 jeton par tranche supplémentaire de 10 Ko.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            SECTION 4 : SÉCURITÉ
        ================================================================ */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={22} className="text-success" />
              <h2 className="text-xl font-semibold text-base-content">Sécurité & Accès</h2>
            </div>

            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-medium">Mot de passe</p>
                <p className="text-sm text-base-content/60 mt-1">Dernière modification : il y a 3 mois</p>
              </div>
              <button className="btn btn-outline btn-sm">
                Mettre à jour
              </button>
            </div>
          </div>
        </div>

        {/* Pied de page / ID */}
        <div className="text-center pt-4">
           <p className="text-sm text-base-content/40">
            Identifiant du compte : <span className="font-mono">#{user?.id || '0000'}</span> · AutoBI v1.0
          </p>
        </div>

      </div>
    </div>
  );
};