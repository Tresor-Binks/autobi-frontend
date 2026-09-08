/**
 * PAGE SETTINGS
 * Paramètres de l'application (thème, préférences, IA, données)
 */

import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

// Définition locale du type
type Theme = 'light' | 'dark';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUnavailableClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setToastMessage('Cette fonctionnalité sera disponible très bientôt !');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto relative">

      {/* Toast d'avertissement */}
      {toastMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white text-sm shadow-lg">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* Apparence */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Apparence</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Thème</h3>
                <p className="text-sm text-base-content/60">
                  Choisir entre le mode clair et sombre
                </p>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="select select-bordered"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Préférences utilisateur */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Préférences utilisateur</h2>
            <div className="space-y-4">
              <div 
                className="label cursor-not-allowed justify-start gap-4 opacity-60"
                onClick={handleUnavailableClick}
              >
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-success cursor-not-allowed" 
                  checked={false} 
                  readOnly 
                />
                <div>
                  <span className="label-text font-medium">Notifications</span>
                  <p className="text-sm text-base-content/60">
                    Être averti à la fin d’une analyse par mail
                  </p>
                </div>
              </div>

              <div 
                className="label cursor-not-allowed justify-start gap-4 opacity-60"
                onClick={handleUnavailableClick}
              >
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-success cursor-not-allowed" 
                  checked={false} 
                  readOnly 
                />
                <div>
                  <span className="label-text font-medium">Sauvegarde locale</span>
                  <p className="text-sm text-base-content/60">
                    Conserver les résultats d’analyse localement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres IA */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Assistant IA</h2>

            <div className="space-y-4">
              <div className="cursor-not-allowed opacity-60" onClick={handleUnavailableClick}>
                <label className="label font-medium cursor-not-allowed">Complexité des réponses</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={2}
                  readOnly
                  className="range range-success xs pointer-events-none"
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                  <span>Simple</span>
                  <span className="font-bold text-success">Équilibré</span>
                  <span>Avancé</span>
                </div>
              </div>

              <div 
                className="flex items-center justify-between cursor-not-allowed opacity-60 pt-2"
                onClick={handleUnavailableClick}
              >
                <div>
                  <h3 className="font-medium">Analyse approfondie</h3>
                  <p className="text-sm text-base-content/60">
                    Générer plus d’insights et de détails
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-success cursor-not-allowed" 
                  checked={false} 
                  readOnly 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Données & confidentialité */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
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
          <div className="card-body text-sm text-base-content/70">
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