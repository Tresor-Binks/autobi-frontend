/**
 * TOPBAR avec système de notifications
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Bell, User, LogOut, X, CheckCheck,
  BarChart3, Coins, Zap, AlertTriangle, Info, Sparkles,
  ExternalLink, Trash2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/auth/AuthModal';
import {
  useNotificationStore,
  Notification,
  NotificationType
} from '../store/notifications';

// ============================================================================
// CONFIG PAR TYPE DE NOTIFICATION
// ============================================================================

const NOTIF_CONFIG: Record<NotificationType, {
  icon: React.ReactNode;
  color: string;
  bg: string;
}> = {
  analyse_complete: {
    icon: <BarChart3 size={16} />,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  analyse_echouee: {
    icon: <AlertTriangle size={16} />,
    color: 'text-error',
    bg: 'bg-error/10',
  },
  tokens_faible: {
    icon: <AlertTriangle size={16} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  achat_tokens: {
    icon: <Coins size={16} />,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  mise_a_jour: {
    icon: <Zap size={16} />,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  nouvelle_fonctionnalite: {
    icon: <Sparkles size={16} />,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

// ============================================================================
// COMPOSANT : UNE NOTIFICATION
// ============================================================================

const NotifItem: React.FC<{
  notif: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  onAction: (notif: Notification) => void;
  isNew: boolean;
}> = ({ notif, onRead, onRemove, onAction, isNew }) => {
  const config = NOTIF_CONFIG[notif.type];

  return (
    <div
      className={`
        relative flex gap-3 p-4 border-b border-base-200 last:border-0
        transition-all duration-300
        ${!notif.read ? 'bg-base-50' : 'bg-base-100'}
        ${isNew ? 'animate-[slideIn_0.3s_ease-out]' : ''}
        hover:bg-base-200/50
      `}
      style={isNew ? { animation: 'slideIn 0.3s ease-out' } : {}}
    >
      {/* Icône */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
        {config.icon}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${!notif.read ? 'text-base-content' : 'text-base-content/70'}`}>
            {notif.title}
          </p>
          <button
            onClick={() => onRemove(notif.id)}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 text-base-content/30 hover:text-base-content/60 transition-opacity"
          >
            <X size={13} />
          </button>
        </div>
        <p className="text-xs text-base-content/60 mt-0.5 leading-relaxed">{notif.message}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-base-content/40">{formatRelativeTime(notif.timestamp)}</span>
          <div className="flex items-center gap-2">
            {!notif.read && (
              <button
                onClick={() => onRead(notif.id)}
                className="text-xs text-base-content/40 hover:text-success transition-colors"
              >
                Marquer lu
              </button>
            )}
            {(notif.actionLabel && (notif.actionUrl || notif.actionExternal)) && (
              <button
                onClick={() => { onRead(notif.id); onAction(notif); }}
                className="text-xs font-medium text-success hover:underline flex items-center gap-1"
              >
                {notif.actionLabel}
                {notif.actionExternal && <ExternalLink size={10} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Point non lu */}
      {!notif.read && (
        <div className="absolute top-4 right-3 w-2 h-2 rounded-full bg-success" />
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT : CLOCHE + MODALE
// ============================================================================

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount,
  } = useNotificationStore();

  const count = unreadCount();

  // Détecte les nouvelles notifications pour l'animation
  useEffect(() => {
    if (count > prevCountRef.current) {
      const unread = notifications.filter(n => !n.read).map(n => n.id);
      setNewIds(new Set(unread.slice(0, count - prevCountRef.current)));
      setTimeout(() => setNewIds(new Set()), 2000);
    }
    prevCountRef.current = count;
  }, [count]);

  // Ferme le panneau si clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleAction = (notif: Notification) => {
    setOpen(false);
    if (notif.actionExternal) {
      window.open(notif.actionExternal, '_blank');
    } else if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost btn-sm btn-square relative"
      >
        <Bell size={18} />

        {/* Badge compteur animé */}
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-success text-success-content text-[10px] font-bold flex items-center justify-center"
            style={{ animation: count > prevCountRef.current ? 'badgePop 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)' : 'none' }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Panneau de notifications */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ animation: 'panelOpen 0.2s ease-out' }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {count > 0 && (
                <span className="badge badge-success badge-sm">{count} nouvelles</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {count > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-ghost btn-xs gap-1 text-xs"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={13} />Tout lire
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"
                  title="Tout effacer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="mx-auto mb-3 text-base-content/20" size={36} />
                <p className="text-sm text-base-content/40">Aucune notification</p>
              </div>
            ) : (
              <div className="group">
                {notifications.map((notif) => (
                  <NotifItem
                    key={notif.id}
                    notif={notif}
                    onRead={markAsRead}
                    onRemove={removeNotification}
                    onAction={handleAction}
                    isNew={newIds.has(notif.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pied */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-base-200 text-center">
              <p className="text-xs text-base-content/40">
                {notifications.length} notification{notifications.length > 1 ? 's' : ''} au total
              </p>
            </div>
          )}
        </div>
      )}

      {/* Styles d'animation */}
      <style>{`
        @keyframes badgePop {
          0% { transform: scale(1); }
          30% { transform: scale(1.5); }
          60% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes panelOpen {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// TOPBAR PRINCIPAL
// ============================================================================

export const TopBar: React.FC<{ theme: string; onThemeToggle: () => void }> = ({ theme, onThemeToggle }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await logout();
    }
  };

  return (
    <>
      <div className="bg-base-100 border-b border-base-300 px-6 py-3 flex items-center justify-end gap-3">

        {/* Thème */}
        <button onClick={onThemeToggle} className="btn btn-ghost btn-sm btn-square">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Utilisateur */}
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm btn-circle">
              <User size={18} />
            </button>
            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2 border border-base-300">
              <li className="menu-title">
                <span>{user.firstName} {user.lastName}</span>
              </li>
              <li><a href="/profile">Mon profil</a></li>
              <li>
                <button onClick={handleLogout}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn btn-success btn-sm"
          >
            Se connecter
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};