/**
 * COMPOSANT MAINLAYOUT
 * Layout principal qui combine Sidebar, TopBar et contenu.
 * Gère le modal d'authentification global pour toutes les pages.
 */

import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AuthModal } from '../components/auth/AuthModal';
import { useTheme } from '../hooks/useTheme';

// Type exporté pour que les pages enfants puissent accéder à onRequestAuth
export type LayoutContext = {
  onRequestAuth: () => void;
};

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="flex h-screen bg-base-200">

      {/* Modal d'authentification global */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar theme={theme} onThemeToggle={toggleTheme} />

        {/* Contenu des pages — passe onRequestAuth via context */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ onRequestAuth: () => setShowAuthModal(true) } satisfies LayoutContext} />
        </main>
      </div>
    </div>
  );
};

// Hook utilitaire pour accéder au context dans les pages enfants
export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}