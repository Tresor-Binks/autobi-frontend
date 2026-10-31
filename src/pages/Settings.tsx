/**
 * PAGE SETTINGS
 * Paramètres de l'application (thème, préférences, IA, données)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check, Bell, HardDrive, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

// Définition locale du type
type Theme = 'light' | 'dark';
type Complexity = 1 | 2 | 3;

const STORAGE_KEYS = {
  notifications: 'autobi_notifications_enabled',
  localBackup: 'autobi_local_backup_enabled',
  complexity: 'autobi_ai_response_complexity',
};

const getStoredBoolean = (key: string, fallback = false): boolean => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
};

const getStoredComplexity = (): Complexity => {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEYS.complexity));
    return value === 1 || value === 2 || value === 3 ? value : 2;
  } catch {
    return 2;
  }
};

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.notifications)
  );
  const [localBackupEnabled, setLocalBackupEnabled] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.localBackup)
  );
  const [complexity, setComplexity] = useState<Complexity>(getStoredComplexity);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2800);
  };

  const handleNotificationsChange = async (enabled: boolean) => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast(
            permission === 'denied'
              ? 'Autorisez les notifications dans les paramètres de votre navigateur.'
              : 'L’autorisation des notifications n’a pas été accordée.',
            'error'
          );
          return;
        }
      } catch {
        showToast('Impossible de demander l’autorisation des notifications.', 'error');
        return;
      }
    }

    if (enabled && 'Notification' in window && Notification.permission === 'denied') {
      showToast('Les notifications sont bloquées dans les paramètres de votre navigateur.', 'error');
      return;
    }

    setNotificationsEnabled(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.notifications, String(enabled));
    } catch {
      // La préférence reste active pour la session en cours.
    }
    showToast(enabled ? 'Préférence de notifications activée.' : 'Notifications désactivées.');
  };

  const handleLocalBackupChange = (enabled: boolean) => {
    setLocalBackupEnabled(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.localBackup, String(enabled));
    } catch {
      // La préférence reste active pour la session en cours.
    }
    showToast(
      enabled
        ? 'Préférence de sauvegarde locale activée.'
        : 'Sauvegarde locale désactivée.'
    );
  };

  const handleComplexityChange = (value: number) => {
    const nextValue = value as Complexity;
    setComplexity(nextValue);
    try {
      localStorage.setItem(STORAGE_KEYS.complexity, String(nextValue));
    } catch {
      // La préférence reste active pour la session en cours.
    }
  };

  const complexityLabels: Record<Complexity, string> = {
    1: 'Simple',
    2: 'Équilibré',
    3: 'Avancé',
  };

  const complexityDescriptions: Record<Complexity, string> = {
    1: 'Des réponses courtes, directes et faciles à comprendre.',
    2: 'Un bon équilibre entre clarté, explications et détails.',
    3: 'Des réponses détaillées, techniques et approfondies.',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto relative">
      {/* Notification de confirmation */}
      {toastMessage && (
        <div className="toast toast-top toast-center z-50">
          <div
            role="status"
            aria-live="polite"
            className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-error'} text-white text-sm shadow-lg transition-all duration-200`}
          >
            <Check size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        {/* Apparence */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Apparence</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-medium">Thème</h3>
                <p className="text-sm text-base-content/60">
                  Choisir entre le mode clair et sombre
                </p>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="select select-bordered w-full sm:w-40"
                aria-label="Choisir le thème"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Préférences utilisateur */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Préférences utilisateur</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 rounded-lg bg-success/10 p-2 text-success">
                    <Bell size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium">Notifications</span>
                    <p className="text-sm text-base-content/60">
                      Autoriser les notifications de l’application dans ce navigateur
                    </p>
                    {'Notification' in window && (
                      <p className="text-xs text-base-content/45 mt-1">
                        Autorisation du navigateur : {
                          Notification.permission === 'granted'
                            ? 'accordée'
                            : Notification.permission === 'denied'
                              ? 'bloquée'
                              : 'à demander'
                        }
                      </p>
                    )}
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-success flex-shrink-0"
                  checked={notificationsEnabled}
                  onChange={(e) => handleNotificationsChange(e.target.checked)}
                  aria-label="Activer les notifications"
                />
              </div>

              <div className="divider my-0" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 rounded-lg bg-success/10 p-2 text-success">
                    <HardDrive size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium">Sauvegarde locale</span>
                    <p className="text-sm text-base-content/60">
                      Enregistrer la préférence de conservation des résultats sur cet appareil
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-success flex-shrink-0"
                  checked={localBackupEnabled}
                  onChange={(e) => handleLocalBackupChange(e.target.checked)}
                  aria-label="Activer la sauvegarde locale"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres IA */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Assistant IA</h2>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <label htmlFor="response-complexity" className="font-medium">
                    Complexité des réponses
                  </label>
                  <span className="badge badge-success badge-outline font-semibold transition-all duration-200">
                    {complexityLabels[complexity]}
                  </span>
                </div>

                <input
                  id="response-complexity"
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={complexity}
                  onChange={(e) => handleComplexityChange(Number(e.target.value))}
                  className="range range-success w-full"
                  aria-valuetext={complexityLabels[complexity]}
                />

                <div className="flex justify-between text-xs text-base-content/60 mt-2">
                  <span className={complexity === 1 ? 'font-bold text-success' : ''}>Simple</span>
                  <span className={complexity === 2 ? 'font-bold text-success' : ''}>Équilibré</span>
                  <span className={complexity === 3 ? 'font-bold text-success' : ''}>Avancé</span>
                </div>

                <div className="mt-4 rounded-xl bg-base-200/70 p-3 sm:p-4 transition-all duration-200">
                  <div className="flex items-start gap-2">
                    <Sparkles size={17} className="text-success mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-base-content/70" aria-live="polite">
                      {complexityDescriptions[complexity]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 opacity-60">
                <div>
                  <h3 className="font-medium">Analyse approfondie</h3>
                  <p className="text-sm text-base-content/60">
                    Générer plus d’insights et de détails
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-success flex-shrink-0"
                  checked={false}
                  readOnly
                  aria-label="Analyse approfondie indisponible"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Données & confidentialité */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Données & confidentialité</h2>

            <div className="space-y-3 text-sm">
              <p className="text-base-content/70">
                Les fichiers Excel sont supprimés après analyse. Seules les données
                utiles et les résultats sont conservés.
              </p>
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4 sm:p-6 text-sm text-base-content/70">
            <p>
              Application d’analyse automatique de fichiers Excel avec génération
              d’insights et visualisations, réalisée dans le cadre d’un projet de
              soutenance en Licence Génie Logiciel.
            </p>
            <p className="mt-2">Version 1.0 – Mode démonstration</p>
          </div>
        </div>
      </div>
    </div>
  );
};
