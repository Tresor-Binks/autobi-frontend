/**
 * COMPOSANT MAINLAYOUT
<<<<<<< HEAD
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

=======
 * Layout principal qui combine Sidebar, TopBar et contenu
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useTheme } from '../hooks/useTheme';

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-base-200">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      {/* Zone principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar theme={theme} onThemeToggle={toggleTheme} />
<<<<<<< HEAD

        {/* Contenu des pages — passe onRequestAuth via context */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ onRequestAuth: () => setShowAuthModal(true) } satisfies LayoutContext} />
=======
        
        {/* Contenu des pages (Router Outlet) */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
        </main>
      </div>
    </div>
  );
<<<<<<< HEAD
};

// Hook utilitaire pour accéder au context dans les pages enfants
export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}
=======
};
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
