/**
 * PAGE SETTINGS
 * Paramètres de l'application (thème, préférences, IA, données)
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';

// Définition locale du type
type Theme = 'light' | 'dark';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 max-w-4xl mx-auto">

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
              <label className="label cursor-pointer justify-start gap-4">
                <input type="checkbox" className="checkbox checkbox-success" defaultChecked />
                <div>
                  <span className="label-text font-medium">Notifications</span>
                  <p className="text-sm text-base-content/60">
                    Être averti à la fin d’une analyse
                  </p>
                </div>
              </label>

              <label className="label cursor-pointer justify-start gap-4">
                <input type="checkbox" className="checkbox checkbox-success" defaultChecked />
                <div>
                  <span className="label-text font-medium">Sauvegarde locale</span>
                  <p className="text-sm text-base-content/60">
                    Conserver les résultats d’analyse localement
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Paramètres IA */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Assistant IA</h2>

            <div className="space-y-4">
              <div>
                <label className="label font-medium">Complexité des réponses</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  defaultValue={2}
                  className="range range-success xs"
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                  <span>Simple</span>
                  <span>Équilibré</span>
                  <span>Avancé</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analyse approfondie</h3>
                  <p className="text-sm text-base-content/60">
                    Générer plus d’insights et de détails
                  </p>
                </div>
                <input type="checkbox" className="toggle toggle-success" defaultChecked />
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
                utiles et les résultats sont conservés temporairement.
              </p>

              <button className="btn btn-outline btn-sm">
                Vider les données locales
              </button>
            </div>
          </div>
        </div>

        {/* Compte */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-base-300">
                <span className="text-base-content/60">Email</span>
                <span className="font-medium">utilisateur@example.com</span>
              </div>
              <div className="flex justify-between py-2 border-b border-base-300">
                <span className="text-base-content/60">Plan</span>
                <span className="font-medium">Gratuit</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-base-content/60">Membre depuis</span>
                <span className="font-medium">Janvier 2026</span>
              </div>
            </div>

            <button className="btn btn-outline btn-sm mt-4">
              Modifier le profil
            </button>
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
