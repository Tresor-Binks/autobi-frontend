/**
 * MODALE D'AUTHENTIFICATION
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, Coins } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials, RegisterData } from '../../api/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

// Validation Regex de l'adresse email
const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

// Validation du mot de passe (au moins 6 caractères)
const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Erreurs de validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
    setError(null);
    setSuccess(null);
    setEmailError(null);
    setPasswordError(null);
    setIsNewUser(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  // Gestion de l'email
  const handleEmailChange = (val: string, formType: 'login' | 'register') => {
    const formattedEmail = val.trim().toLowerCase();
    
    if (formType === 'login') {
      setLoginForm(prev => ({ ...prev, email: formattedEmail }));
    } else {
      setRegisterForm(prev => ({ ...prev, email: formattedEmail }));
    }

    if (formattedEmail && !validateEmail(formattedEmail)) {
      setEmailError('Veuillez entrer une adresse email valide');
    } else {
      setEmailError(null);
    }
  };

  // Gestion du mot de passe
  const handlePasswordChange = (val: string, formType: 'login' | 'register') => {
    if (formType === 'login') {
      setLoginForm(prev => ({ ...prev, password: val }));
    } else {
      setRegisterForm(prev => ({ ...prev, password: val }));
    }

    if (val && !validatePassword(val)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
    } else {
      setPasswordError(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(loginForm.email)) {
      setEmailError('Adresse email invalide');
      return;
    }

    if (!validatePassword(loginForm.password)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await login(loginForm);
      setIsNewUser(false);
      setSuccess('Connexion réussie !');
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(registerForm.email)) {
      setEmailError('Adresse email invalide');
      return;
    }

    if (!validatePassword(registerForm.password)) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await register(registerForm);
      setIsNewUser(true);
      setSuccess('Compte créé avec succès !');
      setTimeout(() => handleClose(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose}></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card bg-base-100 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="card-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {activeTab === 'login' ? 'Connexion' : 'Inscription'}
              </h2>
              <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
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

            {/* Erreur globale */}
            {error && (
              <div className="alert alert-error mb-4">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Succès connexion */}
            {success && !isNewUser && (
              <div className="alert alert-success mb-4">
                <CheckCircle2 size={20} />
                <span>{success}</span>
              </div>
            )}

            {/* Succès inscription */}
            {success && isNewUser && (
              <div className="alert alert-success mb-4 flex flex-col items-start gap-3 p-4">
                <div className="flex items-center gap-2 text-success-content font-bold text-base">
                  <CheckCircle2 size={20} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
                <div className="flex items-start gap-3 bg-base-100/20 text-success-content rounded-lg p-3 w-full border border-base-100/20">
                  <Coins size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">
                    🎉 <strong>Bienvenue !</strong> Vous avez reçu <strong>5 jetons gratuits</strong> pour commencer vos premières analyses sans attendre.
                  </p>
                </div>
              </div>
            )}

            {/* Formulaire connexion */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => handleEmailChange(e.target.value, 'login')}
                      placeholder="votre.email@example.com"
                      className={`input input-bordered w-full pl-10 ${emailError ? 'input-error' : ''}`}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <label className="label">
                      <span className="label-text-alt text-error font-medium">{emailError}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Mot de passe</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => handlePasswordChange(e.target.value, 'login')}
                      placeholder="••••••••"
                      className={`input input-bordered w-full pl-10 ${passwordError ? 'input-error' : ''}`}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {passwordError && (
                    <label className="label">
                      <span className="label-text-alt text-error font-medium">{passwordError}</span>
                    </label>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !!emailError || !!passwordError} 
                  className="btn btn-success w-full"
                >
                  {isLoading ? (
                    <><span className="loading loading-spinner loading-sm"></span>Connexion...</>
                  ) : 'Se connecter'}
                </button>
              </form>
            )}

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Prénom</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        placeholder="Prénom"
                        className="input input-bordered w-full pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Nom</span>
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      placeholder="Nom"
                      className="input input-bordered w-full"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => handleEmailChange(e.target.value, 'register')}
                      placeholder="votre.email@example.com"
                      className={`input input-bordered w-full pl-10 ${emailError ? 'input-error' : ''}`}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <label className="label">
                      <span className="label-text-alt text-error font-medium">{emailError}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Mot de passe</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => handlePasswordChange(e.target.value, 'register')}
                      placeholder="••••••••"
                      className={`input input-bordered w-full pl-10 ${passwordError ? 'input-error' : ''}`}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                  {passwordError ? (
                    <label className="label">
                      <span className="label-text-alt text-error font-medium">{passwordError}</span>
                    </label>
                  ) : (
                    <label className="label">
                      <span className="label-text-alt text-base-content/50">Minimum 6 caractères (lettres ou chiffres)</span>
                    </label>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !!emailError || !!passwordError} 
                  className="btn btn-success w-full"
                >
                  {isLoading ? (
                    <><span className="loading loading-spinner loading-sm"></span>Création...</>
                  ) : 'Créer un compte'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};