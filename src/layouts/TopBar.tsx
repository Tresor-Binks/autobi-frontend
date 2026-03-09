import React, { useState } from 'react';
import { Moon, Sun, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // ← AJOUTER
import { AuthModal } from '../components/auth/AuthModal'; // ← AJOUTER

export const TopBar: React.FC<{ theme: string; onThemeToggle: () => void }> = ({ theme, onThemeToggle }) => {
  const { isAuthenticated, user, logout } = useAuth(); // ← AJOUTER
  const [showAuthModal, setShowAuthModal] = useState(false); // ← AJOUTER

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await logout();
    }
  };

  return (
    <>
      <div className="bg-base-100 border-b border-base-300 px-6 py-3 flex items-center justify-end gap-4">
        <button onClick={onThemeToggle} className="btn btn-ghost btn-sm btn-square">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="btn btn-ghost btn-sm btn-square">
          <Bell size={18} />
        </button>

        {/* ← MODIFIER : Menu utilisateur ou bouton connexion */}
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
              <li><button onClick={handleLogout}><LogOut size={16} /> Déconnexion</button></li>
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

      {/* ← AJOUTER :Modale d'authentification */}
<AuthModal
isOpen={showAuthModal}
onClose={() => setShowAuthModal(false)}
/>
</>
);
};