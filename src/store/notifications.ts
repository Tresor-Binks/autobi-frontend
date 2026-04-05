/**
 * SYSTÈME DE NOTIFICATIONS
 * 
 * Store global pour les notifications de l'application.
 * Types : analyse_complete, tokens_faible, achat_tokens, mise_a_jour, nouvelle_fonctionnalite
 */

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType =
  | 'analyse_complete'
  | 'tokens_faible'
  | 'achat_tokens'
  | 'mise_a_jour'
  | 'nouvelle_fonctionnalite'
  | 'analyse_echouee';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;   // route interne
  actionExternal?: string; // URL externe
  meta?: Record<string, any>; // données supplémentaires (ex: analysisId)
}

// ============================================================================
// STORE ZUSTAND
// ============================================================================

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    // Notifications de démonstration statiques
    {
      id: 'notif_demo_1',
      type: 'nouvelle_fonctionnalite',
      title: 'Nouvelle fonctionnalité',
      message: 'Le dashboard interactif est maintenant disponible avec export PDF.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionLabel: 'Découvrir',
      actionUrl: '/analysis',
    },
    {
      id: 'notif_demo_2',
      type: 'mise_a_jour',
      title: 'Mise à jour v1.1',
      message: 'Amélioration des performances d\'analyse et correction de bugs.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
    },
  ],

  addNotification: (notif) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => set({ notifications: [] }),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

// ============================================================================
// HELPERS
// ============================================================================

export function notifyAnalysisComplete(fileName: string, analysisId: number) {
  useNotificationStore.getState().addNotification({
    type: 'analyse_complete',
    title: 'Analyse terminée',
    message: `L'analyse de "${fileName}" est prête. Consultez votre dashboard.`,
    actionLabel: 'Voir le dashboard',
    actionUrl: `/dashboard/${analysisId}`,
    meta: { analysisId, fileName },
  });
}

export function notifyAnalysisFailed(fileName: string) {
  useNotificationStore.getState().addNotification({
    type: 'analyse_echouee',
    title: 'Analyse échouée',
    message: `L'analyse de "${fileName}" a échoué. Veuillez réessayer.`,
    actionLabel: 'Réessayer',
    actionUrl: '/analysis',
  });
}

export function notifyLowTokens(balance: number) {
  useNotificationStore.getState().addNotification({
    type: 'tokens_faible',
    title: 'Solde de jetons faible',
    message: `Il ne vous reste que ${balance} jeton${balance > 1 ? 's' : ''}. Rechargez pour continuer vos analyses.`,
    actionLabel: 'Acheter des jetons',
    actionExternal: 'https://test.autoi.com',
  });
}

export function notifyTokenPurchase(amount: number) {
  useNotificationStore.getState().addNotification({
    type: 'achat_tokens',
    title: 'Achat de jetons confirmé',
    message: `${amount} jeton${amount > 1 ? 's' : ''} ont été ajoutés à votre compte.`,
    actionLabel: 'Voir mon solde',
    actionUrl: '/profile',
  });
}