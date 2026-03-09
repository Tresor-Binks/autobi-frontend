/**
 * COMPOSANT SIDEBAR
 * Barre de navigation latérale avec menu principal
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  History, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/' },
    { id: 'analysis', label: 'Analyse', icon: BarChart3, path: '/analysis' },
    { id: 'history', label: 'Historique', icon: History, path: '/history' },
    { id: 'ai', label: 'IA', icon: MessageSquare, path: '/ai' },
    { id: 'help', label: 'Aide', icon: HelpCircle, path: '/help' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' }
  ];

  return (
    <div className={`bg-base-100 border-r border-base-300 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header avec logo et bouton collapse */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        {!collapsed && (
          <h1 className="font-semibold text-lg text-success">AUTO BI</h1>
        )}
        <button 
          onClick={onToggle} 
          className="btn btn-ghost btn-sm btn-square"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Navigation menu */}
      <nav className="flex-1 p-2">
        {menuItems.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 transition-colors
              ${isActive ? 'bg-success/10 text-success' : 'hover:bg-base-200'}
            `}
          >
            <item.icon size={20} />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};