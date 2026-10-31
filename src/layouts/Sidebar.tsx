import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BarChart3,
  History,
  MessageSquare,
  Settings,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
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

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/' },
    { id: 'analysis', label: 'Analyses', icon: BarChart3, path: '/analysis' },
    { id: 'history', label: 'Historique', icon: History, path: '/history' },
    { id: 'ai', label: 'IA', icon: MessageSquare, path: '/ai' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
  ];

  const profileItem: MenuItem = {
    id: 'profile',
    label: 'Profil',
    icon: User,
    path: '/profile',
  };

  const mobileMenuItems: MenuItem[] = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/' },
    { id: 'history', label: 'Historique', icon: History, path: '/history' },
    { id: 'analysis', label: 'Analyse', icon: Plus, path: '/analysis' },
    { id: 'ai', label: 'IA', icon: MessageSquare, path: '/ai' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* ==========================================
          DESKTOP SIDEBAR (INCHANGÉE)
      ========================================== */}

      <aside
        className={`
          hidden md:flex
          h-full flex-col flex-shrink-0
          bg-base-100 border-r border-base-300
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* LOGO */}
        <div className="h-16 px-4 border-b border-base-300 flex items-center justify-between flex-shrink-0">

          {!collapsed && (
            <div className="flex items-center gap-2">

              <span className="font-bold text-xl tracking-tight">
                AUTO<span className="text-success">BI</span>
              </span>
            </div>
          )}

          

          <button
            onClick={onToggle}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Réduire ou agrandir la sidebar"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

          

          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.id === 'home'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `
                relative flex items-center gap-3
                px-3 py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-success/10 text-success font-semibold'
                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon
                size={20}
                strokeWidth={2}
                className="flex-shrink-0"
              />

              {!collapsed && (
                <span className="text-sm">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* PROFIL EN BAS DE LA SIDEBAR */}
        <div className="p-3 border-t border-base-300 flex-shrink-0">
          <NavLink
            to={profileItem.path}
            title={collapsed ? profileItem.label : undefined}
            className={({ isActive }) => `
              relative flex items-center gap-3
              px-3 py-3 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? 'bg-success/10 text-success font-semibold'
                  : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <User size={20} strokeWidth={2} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Profil</span>}
          </NavLink>
        </div>
      </aside>


      {/* ==========================================
          MOBILE BOTTOM NAVIGATION (AMÉLIORÉE)
      ========================================== */}

      <nav
        aria-label="Navigation mobile"
        className="
          md:hidden
          fixed bottom-0 left-0 right-0
          z-50
          bg-base-100/90 backdrop-blur-2xl
          border-t border-base-300/60
          shadow-[0_-10px_30px_rgba(0,0,0,0.08)]
        "
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto px-3 py-2">
          {mobileMenuItems.map((item) => {
            const isActionBtn = item.id === 'analysis';

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.id === 'home'}
                aria-label={item.label}
                className={({ isActive }) => `
                  relative flex flex-col items-center justify-center
                  group transition-all duration-300
                  ${isActionBtn ? '-mt-5' : 'py-1'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Bouton central mis en avant (Action principale) */}
                    {isActionBtn ? (
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-success text-white shadow-xl shadow-success/30 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-base-100">
                        <item.icon size={26} strokeWidth={2.5} />
                      </div>
                    ) : (
                      /* Boutons de navigation classiques avec effet pilule actif et micro-labels */
                      <div
                        className={`
                          flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300
                          ${
                            isActive
                              ? 'text-success bg-success/10 scale-105 font-medium'
                              : 'text-base-content/50 hover:text-base-content hover:bg-base-200/50'
                          }
                        `}
                      >
                        <item.icon
                          size={22}
                          strokeWidth={isActive ? 2.5 : 1.8}
                          className="transition-transform duration-300"
                        />
                        <span className="text-[10px] tracking-tight leading-none">
                          {item.label}
                        </span>
                      </div>
                    )}

                    {/* Petit indicateur discret pour le bouton central si actif */}
                    {isActionBtn && isActive && (
                      <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-success"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;