/**
 * CONFIGURATION DU ROUTER
 * Définit toutes les routes de l'application
 */

import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Analysis } from '../pages/Analysis';
import { History } from '../pages/History';
<<<<<<< HEAD
import { Dashboard } from '../pages/Dashboard';
=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
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
<<<<<<< HEAD
        path: 'dashboard/:analysisId',
        element: <Dashboard />
      },
      {
=======
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
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