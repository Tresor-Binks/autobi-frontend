/**
 * APP - COMPOSANT RACINE
 * 
 * Affiche le loader pendant 5 secondes à chaque rechargement,
 * puis affiche l'application principale
 */

import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AutoBILoader } from './components/AutoBILoader';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Timer de 5 secondes
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    // Nettoyage du timer
    return () => clearTimeout(timer);
  }, []);

  // Afficher le loader pendant 5 secondes
  if (showLoader) {
    return <AutoBILoader />;
  }

  // Afficher l'application principale
  return <RouterProvider router={router} />;
}