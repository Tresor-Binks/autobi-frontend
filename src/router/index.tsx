/**
 * CONFIGURATION DU ROUTER
 * Définit toutes les routes de l'application
 */

import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Analysis } from '../pages/Analysis';
import { History } from '../pages/History';
import { IA } from '../pages/IA';
import { Help } from '../pages/Help';
import { Settings } from '../pages/Settings';
import { Profile } from '../pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'analysis',
        element: <Analysis />
      },
      {
        path: 'history',
        element: <History />
      },
      {
        path: 'ai',
        element: <IA />
      },
      {
        path: 'help',
        element: <Help />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'profile',
        element: <Profile />
      },
    ]
  }
]);