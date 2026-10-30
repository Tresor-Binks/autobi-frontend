
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BarChart3,
  History,
  MessageSquare,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Database,
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
    { id: 'profile', label: 'Profil', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* ==========================================
          DESKTOP SIDEBAR
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

        {/* FOOTER */}
        {!collapsed && (
          <div className="p-4 border-t border-base-300">
            <div className="flex items-center gap-2 text-xs text-base-content/40">
              <Database size={14} />
              <span>AUTO BI Workspace</span>
            </div>
          </div>
        )}
      </aside>


      {/* ==========================================
          MOBILE BOTTOM NAVIGATION
      ========================================== */}

      <nav
        aria-label="Navigation mobile"
        className="
          md:hidden
          fixed bottom-0 left-0 right-0
          z-50
          bg-base-100/95 backdrop-blur-xl
          border-t border-base-300/80
          shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
        "
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="grid grid-cols-6 items-center px-1 pt-2 pb-1">

          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.id === 'home'}
              aria-label={item.label}
              className={({ isActive }) => `
                relative flex flex-col
                items-center justify-center
                gap-1
                min-w-0
                py-1.5 px-0.5
                rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? 'text-success'
                    : 'text-base-content/45 hover:text-base-content/80'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* INDICATEUR ACTIF */}
                  {isActive && (
                    <span className="absolute -top-2 w-7 h-[3px] rounded-full bg-success" />
                  )}

                  {/* ICÔNE */}
                  <span
                    className={`
                      flex items-center justify-center
                      w-9 h-7 rounded-xl
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-success/10'
                          : 'bg-transparent'
                      }
                    `}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.4 : 1.8}
                    />
                  </span>

                  {/* LIBELLÉ */}
                  <span
                    className={`
                      text-[9px] sm:text-[10px]
                      leading-tight
                      text-center
                      whitespace-nowrap
                      transition-all
                      ${
                        isActive
                          ? 'font-bold'
                          : 'font-medium'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

        </div>
      </nav>
    </>
  );
};

export default Sidebar;
