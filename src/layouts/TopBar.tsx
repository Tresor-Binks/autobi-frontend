/**
 * TOPBAR avec notifications, bouton Nouvelle analyse et lien profil
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Bell, User, LogOut, X, CheckCheck,
  BarChart3, Coins, Zap, AlertTriangle, Sparkles,
  ExternalLink, Trash2, Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/auth/AuthModal';
import {
  useNotificationStore,
  Notification,
  NotificationType
} from '../store/notifications';

// ============================================================================
// CONFIG NOTIFICATIONS
// ============================================================================

const NOTIF_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  analyse_complete:      { icon: <BarChart3 size={15} />,    color: 'text-success',    bg: 'bg-success/10' },
  analyse_echouee:       { icon: <AlertTriangle size={15} />, color: 'text-error',      bg: 'bg-error/10' },
  tokens_faible:         { icon: <AlertTriangle size={15} />, color: 'text-warning',    bg: 'bg-warning/10' },
  achat_tokens:          { icon: <Coins size={15} />,         color: 'text-success',    bg: 'bg-success/10' },
  mise_a_jour:           { icon: <Zap size={15} />,           color: 'text-info',       bg: 'bg-info/10' },
  nouvelle_fonctionnalite: { icon: <Sparkles size={15} />,   color: 'text-purple-500', bg: 'bg-purple-50' },
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
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
        group relative flex gap-3 px-4 py-3 border-b border-base-200 last:border-0
        transition-colors duration-150
        ${!notif.read ? 'bg-base-50' : 'bg-base-100'}
        hover:bg-base-200/40
      `}
      style={isNew ? { animation: 'slideIn 0.25s ease-out' } : {}}
    >
      {/* Icône type */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${config.bg} ${config.color}`}>
        {config.icon}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-semibold leading-snug ${!notif.read ? 'text-base-content' : 'text-base-content/60'}`}>
            {notif.title}
          </p>
          <button
            onClick={() => onRemove(notif.id)}
            className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-base-content/30 hover:text-base-content/60 transition-opacity mt-0.5"
          >
            <X size={12} />
          </button>
        </div>
        <p className="text-xs text-base-content/55 mt-0.5 leading-relaxed">{notif.message}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-base-content/35">{formatRelativeTime(notif.timestamp)}</span>
          <div className="flex items-center gap-2">
            {!notif.read && (
              <button onClick={() => onRead(notif.id)} className="text-[11px] text-base-content/35 hover:text-success transition-colors">
                Lu
              </button>
            )}
            {notif.actionLabel && (notif.actionUrl || notif.actionExternal) && (
              <button
                onClick={() => { onRead(notif.id); onAction(notif); }}
                className="text-[11px] font-medium text-success hover:underline flex items-center gap-0.5"
              >
                {notif.actionLabel}
                {notif.actionExternal && <ExternalLink size={9} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Point non lu */}
      {!notif.read && (
        <div className="absolute top-3.5 right-3 w-1.5 h-1.5 rounded-full bg-success" />
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT : CLOCHE
// ============================================================================

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll, unreadCount } = useNotificationStore();
  const count = unreadCount();

  useEffect(() => {
    if (count > prevCountRef.current) {
      const unread = notifications.filter(n => !n.read).map(n => n.id);
      setNewIds(new Set(unread.slice(0, count - prevCountRef.current)));
      setTimeout(() => setNewIds(new Set()), 2000);
    }
    prevCountRef.current = count;
  }, [count]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleAction = (notif: Notification) => {
    setOpen(false);
    if (notif.actionExternal) window.open(notif.actionExternal, '_blank');
    else if (notif.actionUrl) navigate(notif.actionUrl);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost btn-sm btn-square relative"
      >
        <Bell size={17} />
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-success text-success-content text-[9px] font-bold flex items-center justify-center"
            style={{ animation: 'badgePop 0.35s cubic-bezier(0.36,0.07,0.19,0.97)' }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-76 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ width: '300px', animation: 'panelOpen 0.18s ease-out' }}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Notifications</span>
              {count > 0 && <span className="badge badge-success badge-xs">{count}</span>}
            </div>
            <div className="flex items-center gap-1">
              {count > 0 && (
                <button onClick={markAllAsRead} className="btn btn-ghost btn-xs gap-1 text-xs opacity-60 hover:opacity-100">
                  <CheckCheck size={12} />Tout lire
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="btn btn-ghost btn-xs opacity-40 hover:text-error hover:opacity-100">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto mb-2 text-base-content/20" size={28} />
                <p className="text-xs text-base-content/40">Aucune notification</p>
              </div>
            ) : (
              notifications.map(notif => (
                <NotifItem
                  key={notif.id}
                  notif={notif}
                  onRead={markAsRead}
                  onRemove={removeNotification}
                  onAction={handleAction}
                  isNew={newIds.has(notif.id)}
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-base-200">
              <p className="text-[11px] text-base-content/35 text-center">
                {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes badgePop {
          0%  { transform: scale(1); }
          35% { transform: scale(1.45); }
          65% { transform: scale(0.88); }
          100%{ transform: scale(1); }
        }
        @keyframes panelOpen {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// TOPBAR PRINCIPAL
// ============================================================================

export const TopBar: React.FC<{ theme: string; onThemeToggle: () => void }> = ({ theme, onThemeToggle }) => {
  const navigate = useNavigate();
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

        {/* Bouton Nouvelle analyse — uniquement si connecté */}
        {isAuthenticated && (
          <button
            onClick={() => navigate('/analysis')}
            className="btn btn-success btn-sm gap-2"
          >
            <Plus size={15} />
            Nouvelle analyse
          </button>
        )}

        {/* Séparateur */}
        {isAuthenticated && <div className="w-px h-5 bg-base-300" />}

        {/* Thème */}
        <button onClick={onThemeToggle} className="btn btn-ghost btn-sm btn-square">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Menu utilisateur ou bouton connexion */}
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm gap-2 px-3">
              <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center">
                <User size={13} className="text-success" />
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user.firstName}
              </span>
            </button>
            <ul className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-xl w-52 mt-2 border border-base-300">
              {/* Info utilisateur */}
              <li className="px-3 py-2 mb-1">
                <div className="flex flex-col gap-0 cursor-default hover:bg-transparent focus:bg-transparent active:bg-transparent">
                  <span className="font-semibold text-sm">{user.firstName} {user.lastName}</span>
                  <span className="text-xs text-base-content/50 truncate">{user.email}</span>
                  <span className="text-xs text-success mt-1 font-medium">
                    {user.token_balance} jeton{user.token_balance > 1 ? 's' : ''}
                  </span>
                </div>
              </li>
              <div className="divider my-0.5" />
              <li>
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm">
                  <User size={14} />Mon profil
                </button>
              </li>
              <li>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-error">
                  <LogOut size={14} />Déconnexion
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn btn-success btn-sm">
            Se connecter
          </button>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};