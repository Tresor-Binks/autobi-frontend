/**
 * MODALE D'AUTHENTIFICATION
<<<<<<< HEAD
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, Coins } from 'lucide-react';
=======
 * 
 * Modale DaisyUI avec deux onglets :
 * - Connexion
 * - Inscription
 * 
 * Compatible web et desktop (WebView)
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials, RegisterData } from '../../api/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

<<<<<<< HEAD
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
=======
export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
}) => {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
<<<<<<< HEAD
  const [isNewUser, setIsNewUser] = useState(false);

=======

  // Formulaire de connexion
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

<<<<<<< HEAD
=======
  // Formulaire d'inscription
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const [registerForm, setRegisterForm] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

<<<<<<< HEAD
=======
  /**
   * Reset des formulaires
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
    setError(null);
    setSuccess(null);
<<<<<<< HEAD
    setIsNewUser(false);
  };

=======
  };

  /**
   * Fermeture de la modale
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const handleClose = () => {
    resetForms();
    onClose();
  };

<<<<<<< HEAD
=======
  /**
   * Gestion de la connexion
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await login(loginForm);
<<<<<<< HEAD
      setIsNewUser(false);
      setSuccess('Connexion réussie !');
      setTimeout(() => handleClose(), 1000);
=======
      setSuccess('Connexion réussie !');
      setTimeout(() => {
        handleClose();
      }, 1000);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
=======
  /**
   * Gestion de l'inscription
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await register(registerForm);
<<<<<<< HEAD
      setIsNewUser(true);
      setSuccess('Compte créé avec succès !');
      setTimeout(() => handleClose(), 3000);
=======
      setSuccess('Compte créé avec succès !');
      setTimeout(() => {
        handleClose();
      }, 1000);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
<<<<<<< HEAD
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose}></div>

=======
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose}></div>

      {/* Modale */}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card bg-base-100 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="card-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {activeTab === 'login' ? 'Connexion' : 'Inscription'}
              </h2>
<<<<<<< HEAD
              <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
=======
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-6">
              <button
                className={`tab flex-1 ${activeTab === 'login' ? 'bg-base-100 text-base-content border-base-300' : ''}`}
                onClick={() => { setActiveTab('login'); resetForms(); }}
              >
                Connexion
              </button>
              <button
                className={`tab flex-1 ${activeTab === 'register' ? 'bg-base-100 text-base-content border-base-300' : ''}`}
                onClick={() => { setActiveTab('register'); resetForms(); }}
              >
                Inscription
              </button>
            </div>

<<<<<<< HEAD
            {/* Erreur */}
=======
            {/* Alerts */}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
            {error && (
              <div className="alert alert-error mb-4">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

<<<<<<< HEAD
            {/* Succès connexion */}
            {success && !isNewUser && (
=======
            {success && (
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
              <div className="alert alert-success mb-4">
                <CheckCircle2 size={20} />
                <span>{success}</span>
              </div>
            )}

<<<<<<< HEAD
            {/* Succès inscription — message spécial avec jetons */}
            {success && isNewUser && (
              <div className="alert alert-success mb-4 flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">{success}</span>
                </div>
                <div className="flex items-center gap-2 bg-success/20 rounded-lg px-3 py-2 w-full">
                  <Coins size={18} className="text-success flex-shrink-0" />
                  <p className="text-sm">
                    🎉 Bienvenue ! Vous avez reçu <strong>5 jetons gratuits</strong> pour commencer vos premières analyses sans attendre.
                  </p>
                </div>
              </div>
            )}

            {/* Formulaire connexion */}
=======
            {/* Formulaire de connexion */}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="votre.email@example.com"
                      className="input input-bordered w-full pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mot de passe</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="input input-bordered w-full pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

<<<<<<< HEAD
                <button type="submit" disabled={isLoading} className="btn btn-success w-full">
                  {isLoading ? (
                    <><span className="loading loading-spinner loading-sm"></span>Connexion...</>
                  ) : 'Se connecter'}
=======
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-success w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                </button>
              </form>
            )}

<<<<<<< HEAD
            {/* Formulaire inscription */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">

                {/* Bandeau 5 jetons gratuits */}
                {!success && (
                  <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                    <Coins size={16} className="text-success flex-shrink-0" />
                    <p className="text-sm text-success font-medium">
                      5 jetons gratuits offerts à l'inscription
                    </p>
                  </div>
                )}

=======
            {/* Formulaire d'inscription */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Prénom</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
<<<<<<< HEAD
                        placeholder="Prénom"
=======
                        placeholder="Trésor"
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                        className="input input-bordered w-full pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nom</span>
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
<<<<<<< HEAD
                      placeholder="Nom"
=======
                      placeholder="Makosso"
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                      className="input input-bordered w-full"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="votre.email@example.com"
                      className="input input-bordered w-full pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mot de passe</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="input input-bordered w-full pl-10"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt">Minimum 6 caractères</span>
                  </label>
                </div>

<<<<<<< HEAD
                <button type="submit" disabled={isLoading} className="btn btn-success w-full">
                  {isLoading ? (
                    <><span className="loading loading-spinner loading-sm"></span>Création...</>
                  ) : 'Créer un compte'}
=======
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-success w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Création...
                    </>
                  ) : (
                    'Créer un compte'
                  )}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};