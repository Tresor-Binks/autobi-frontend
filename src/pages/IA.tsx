/**
 * PAGE IA - ASSISTANT INTELLIGENT
<<<<<<< HEAD
 * Chat IA basé sur les vraies analyses.
 * Gestion propre de l'indisponibilité OpenAI.
=======
 * 
 * Cette page permet à l'utilisateur de poser des questions à l'IA
 * concernant une analyse spécifique de fichier Excel.
 * 
 * LOGIQUE UX :
 * 1. L'utilisateur doit d'abord sélectionner une analyse existante
 * 2. Une fois sélectionnée, le chat IA devient actif
 * 3. Les questions posées concernent uniquement l'analyse sélectionnée
 * 4. Si aucune analyse n'existe, afficher un message d'orientation
 * 
 * WORKFLOW :
 * - État initial : sélection d'analyse désactivée
 * - État sélectionné : chat IA actif
 * - État vide : redirection vers nouvelle analyse
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import {
  MessageSquare, Upload, AlertCircle, Sparkles, Send,
  FileSpreadsheet, LogIn, WifiOff, Loader, Clock, CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLayoutContext } from '../layouts/MainLayout';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Message {
  role: 'user' | 'ai' | 'error';
=======
import { MessageSquare, Upload, AlertCircle, Sparkles, Send, FileSpreadsheet } from 'lucide-react';
import { apiService } from '../api';

/**
 * Interface représentant un message dans le chat
 */
interface Message {
  role: 'user' | 'ai';
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  content: string;
  timestamp: Date;
}

<<<<<<< HEAD
interface AnalysisItem {
  id: number;
  file_name: string;
  status: string;
  tokens_consumed: number;
  created_at: string | null;
=======
/**
 * Interface représentant une analyse disponible (DONNÉES MOCKÉES)
 */
interface Analysis {
  id: string;
  name: string;
  date: string;
  status: string;
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
}

export const IA: React.FC = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { isAuthenticated } = useAuth();
  const { onRequestAuth } = useLayoutContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) loadAnalyses();
    else setIsLoadingAnalyses(false);
  }, [isAuthenticated]);

=======
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // ÉTAT LOCAL
  // ============================================================================
  
  /**
   * Analyse actuellement sélectionnée
   */
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  /**
   * Liste des messages du chat
   */
  const [messages, setMessages] = useState<Message[]>([]);

  /**
   * Texte saisi par l'utilisateur
   */
  const [input, setInput] = useState('');

  /**
   * Indicateur de chargement lors de l'envoi d'une question
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Liste des analyses disponibles (MOCKÉES pour le développement front-end)
   */
  const [analyses] = useState<Analysis[]>([
    {
      id: 'a1',
      name: 'ventes_2024.xlsx',
      date: '2024-12-01',
      status: 'Terminé',
    },
    {
      id: 'a2',
      name: 'stocks_q1.xlsx',
      date: '2025-01-15',
      status: 'Terminé',
    },
    {
      id: 'a3',
      name: 'budget_marketing.xlsx',
      date: '2025-01-20',
      status: 'Terminé',
    },
  ]);

  // ============================================================================
  // EFFETS
  // ============================================================================

  /**
   * Auto-scroll vers le bas lors de l'ajout de nouveaux messages
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

<<<<<<< HEAD
  const loadAnalyses = async () => {
    setIsLoadingAnalyses(true);
    try {
      const res = await fetch(`${BASE_URL}/analysis/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setAnalyses(data.filter((a: AnalysisItem) => a.status.toLowerCase() === 'completed'));
    } catch (error) {
      console.error('Erreur chargement analyses:', error);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedAnalysis || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setServiceUnavailable(false);

    try {
      const res = await fetch(`${BASE_URL}/analysis/${selectedAnalysis.id}/ask`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.service_unavailable) {
        setServiceUnavailable(true);
        setServiceError(data.detail || "Le service d'analyse IA est actuellement indisponible.");
        setMessages(prev => [...prev, {
          role: 'error',
          content: data.detail || "Le service d'analyse IA est actuellement indisponible. Veuillez réessayer plus tard.",
          timestamp: new Date(),
        }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.answer, timestamp: new Date() }]);

    } catch (error: any) {
      setServiceUnavailable(true);
      setServiceError("Impossible de contacter le service. Vérifiez votre connexion.");
      setMessages(prev => [...prev, {
        role: 'error',
        content: "Impossible de contacter le service. Vérifiez votre connexion internet.",
        timestamp: new Date(),
      }]);
=======
  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Gestion de la sélection d'une analyse
   */
  const handleSelectAnalysis = (analysisId: string) => {
    const analysis = analyses.find((a) => a.id === analysisId);
    if (analysis) {
      setSelectedAnalysis(analysis);
      setMessages([]); // Réinitialiser le chat lors du changement d'analyse
      setInput('');
    }
  };

  /**
   * Envoi d'une question à l'IA
   */
  const handleSend = async () => {
    if (!input.trim() || !selectedAnalysis) return;

    // Créer le message utilisateur
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Ajouter le message utilisateur à la liste
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Appel à l'API (mockée pour l'instant)
      const response = await apiService.askQuestion(selectedAnalysis.id, input);

      // Créer le message de l'IA
      const aiMessage: Message = {
        role: 'ai',
        content: response.answer,
        timestamp: new Date(),
      };

      // Ajouter la réponse de l'IA
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erreur lors de la question IA:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        role: 'ai',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSelectAnalysis = (analysis: AnalysisItem) => {
    setSelectedAnalysis(analysis);
    setMessages([]);
    setInput('');
    setServiceUnavailable(false);
    setServiceError(null);
  };

=======
  /**
   * Gestion de la touche Entrée pour envoyer
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Réinitialiser la sélection (changer d'analyse)
   */
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const handleChangeAnalysis = () => {
    setSelectedAnalysis(null);
    setMessages([]);
    setInput('');
<<<<<<< HEAD
    setServiceUnavailable(false);
    setServiceError(null);
  };

  // ---- NON CONNECTÉ ----
  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="relative">
          <div className="opacity-30 pointer-events-none select-none card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body py-16 text-center">
              <MessageSquare className="mx-auto mb-4 text-base-content/30" size={48} />
              <div className="h-6 w-48 bg-base-300 rounded mx-auto mb-3" />
              <div className="h-4 w-64 bg-base-200 rounded mx-auto" />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-base-100/80 backdrop-blur-sm">
            <div className="text-center space-y-4 p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-2">
                <LogIn className="text-success" size={32} />
              </div>
              <h3 className="text-xl font-bold">Connexion requise</h3>
              <p className="text-base-content/70 max-w-xs">
                Connectez-vous pour accéder à l'assistant IA.
              </p>
              <button onClick={onRequestAuth} className="btn btn-success">
                <LogIn size={18} />Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingAnalyses) return (
    <div className="p-8 flex justify-center items-center">
      <span className="loading loading-spinner loading-lg text-success"></span>
    </div>
  );

  // ---- AUCUNE ANALYSE ----
  if (analyses.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center py-16">
            <AlertCircle className="mx-auto mb-4 text-warning" size={48} />
            <h2 className="text-xl font-semibold mb-2">Aucune analyse disponible</h2>
            <p className="text-base-content/70 mb-6 max-w-sm mx-auto">
              Vous devez d'abord effectuer au moins une analyse pour pouvoir
              poser des questions à l'assistant IA.
            </p>
            <button onClick={() => navigate('/analysis')} className="btn btn-success mx-auto">
              <Upload size={18} />Lancer une analyse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- SÉLECTION D'ANALYSE ----
  if (!selectedAnalysis) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="alert border border-info/30 bg-info/5">
          <Sparkles className="text-info flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold">Assistant IA</h3>
            <p className="text-sm">
              Sélectionnez une analyse pour poser des questions sur vos données.
              L'IA répondra en se basant uniquement sur les données de cette analyse.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4">Choisissez une analyse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => handleSelectAnalysis(analysis)}
                  className="p-4 border-2 border-base-300 rounded-lg cursor-pointer hover:border-success hover:bg-success/5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="text-success flex-shrink-0 mt-1" size={22} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{analysis.file_name}</h3>
                      {analysis.created_at && (
                        <p className="text-xs text-base-content/50 flex items-center gap-1 mt-1">
                          <Clock size={10} />
                          {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge badge-success badge-sm flex items-center gap-1">
                          <CheckCircle2 size={10} />Terminée
                        </span>
                        {analysis.tokens_consumed > 0 && (
                          <span className="text-xs text-base-content/40">
                            {analysis.tokens_consumed} jeton{analysis.tokens_consumed > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- CHAT ACTIF ----
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-4">

      {/* Analyse sélectionnée */}
      <div className="card bg-success/5 border border-success/30 shadow-sm">
        <div className="card-body py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-success" size={18} />
              <div>
                <span className="text-sm font-medium">Analyse : </span>
                <span className="font-semibold">{selectedAnalysis.file_name}</span>
                {selectedAnalysis.created_at && (
                  <span className="ml-2 text-xs text-base-content/50">
                    ({new Date(selectedAnalysis.created_at).toLocaleDateString('fr-FR')})
                  </span>
                )}
              </div>
            </div>
            <button onClick={handleChangeAnalysis} className="btn btn-ghost btn-sm">
              Changer
            </button>
          </div>
        </div>
      </div>

      {/* Bannière service indisponible */}
      {serviceUnavailable && (
        <div className="alert alert-warning">
          <WifiOff size={18} />
          <div className="flex-1">
            <p className="font-semibold text-sm">Service IA indisponible</p>
            <p className="text-xs mt-0.5">{serviceError}</p>
          </div>
          <button
            onClick={() => { setServiceUnavailable(false); setServiceError(null); }}
            className="btn btn-ghost btn-xs"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Zone de chat */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-0 flex flex-col" style={{ height: '560px' }}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="mx-auto mb-4 text-base-content/30" size={44} />
                <h3 className="text-lg font-semibold mb-2">
                  Posez vos questions sur {selectedAnalysis.file_name}
                </h3>
                <p className="text-base-content/50 mb-6 text-sm">
                  L'IA analysera les données de ce fichier pour vous répondre
                </p>
                <div className="max-w-sm mx-auto space-y-2">
                  <p className="text-xs font-medium text-base-content/50 mb-2">Suggestions :</p>
                  {[
                    'Résume les principaux insights de cette analyse',
                    'Quelles sont les tendances observées ?',
                    'Quelles recommandations peux-tu faire ?',
                    'Quelles sont les valeurs les plus importantes ?',
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(suggestion)}
                      className="block w-full text-left px-4 py-2.5 bg-base-200 hover:bg-base-300 rounded-lg text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-success text-success-content'
                        : msg.role === 'error'
                        ? 'bg-warning/10 border border-warning/30'
                        : 'bg-base-200'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={14} className="text-success" />
                          <span className="text-xs font-semibold text-success">Assistant IA</span>
                        </div>
                      )}
                      {msg.role === 'error' && (
                        <div className="flex items-center gap-2 mb-2">
                          <WifiOff size={14} className="text-warning" />
                          <span className="text-xs font-semibold text-warning">Service indisponible</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-success-content/60' : 'text-base-content/40'}`}>
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-base-200 p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="loading loading-dots loading-sm"></span>
                        <span className="text-sm text-base-content/60">L'IA réfléchit...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Saisie */}
          <div className="border-t border-base-300 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question sur cette analyse..."
                className="input input-bordered flex-1"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="btn btn-success"
              >
                {isLoading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <Send size={18} />
                }
              </button>
            </div>
            <p className="text-xs text-base-content/40 mt-2">
              💡 Basé sur l'analyse de <strong>{selectedAnalysis.file_name}</strong>
            </p>
          </div>
        </div>
      </div>
=======
  };

  // ============================================================================
  // RENDU
  // ============================================================================

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-[calc(100vh-8rem)]">

      {/* ================================================================
          CAS 1 : AUCUNE ANALYSE DISPONIBLE
          ================================================================ */}
      {analyses.length === 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center py-16">
            <AlertCircle className="mx-auto mb-4 text-warning" size={56} />
            <h2 className="text-2xl font-semibold mb-2">Aucune analyse disponible</h2>
            <p className="text-base-content/70 mb-6">
              Vous devez d'abord effectuer une analyse de fichier Excel pour pouvoir
              poser des questions à l'assistant IA.
            </p>
            <button
              onClick={() => navigate('/analysis')}
              className="btn btn-success btn-lg mx-auto"
            >
              <Upload size={20} />
              Lancer une nouvelle analyse
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          CAS 2 : ANALYSES DISPONIBLES - SÉLECTION REQUISE
          ================================================================ */}
      {analyses.length > 0 && !selectedAnalysis && (
        <div className="space-y-6">
          {/* Message d'instruction */}
          <div className="alert border border-info/30 bg-info/5">
            <AlertCircle className="text-info flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold">Sélection d'analyse requise</h3>
              <p className="text-sm">
                Veuillez sélectionner une analyse pour poser des questions à l'IA.
                Les réponses seront basées uniquement sur les données de cette analyse.
              </p>
            </div>
          </div>

          {/* Sélection via cards cliquables */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">
                Choisissez une analyse
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => handleSelectAnalysis(analysis.id)}
                    className="p-4 border-2 border-base-300 rounded-lg cursor-pointer hover:border-success hover:bg-success/5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="text-success flex-shrink-0 mt-1" size={24} />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{analysis.name}</h3>
                        <p className="text-sm text-base-content/60 mb-2">
                          {new Date(analysis.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <span className="badge badge-success badge-sm">
                          {analysis.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alternative : Select dropdown */}
              <div className="divider">OU</div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Sélectionner via la liste déroulante
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  onChange={(e) => handleSelectAnalysis(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Choisir une analyse --
                  </option>
                  {analyses.map((analysis) => (
                    <option key={analysis.id} value={analysis.id}>
                      {analysis.name} - {new Date(analysis.date).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          CAS 3 : ANALYSE SÉLECTIONNÉE - CHAT IA ACTIF
          ================================================================ */}
      {selectedAnalysis && (
        <div className="space-y-4">
          {/* Indicateur d'analyse sélectionnée */}
          <div className="card bg-success/5 border border-success/30 shadow-sm">
            <div className="card-body py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-success" size={20} />
                  <div>
                    <span className="text-sm font-medium">Analyse sélectionnée :</span>
                    <span className="ml-2 font-semibold">{selectedAnalysis.name}</span>
                    <span className="ml-2 text-sm text-base-content/60">
                      ({new Date(selectedAnalysis.date).toLocaleDateString('fr-FR')})
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleChangeAnalysis}
                  className="btn btn-ghost btn-sm"
                >
                  Changer d'analyse
                </button>
              </div>
            </div>
          </div>

          {/* Zone de chat */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-0 flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  /* État vide - suggestions de questions */
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto mb-4 text-base-content/40" size={48} />
                    <h3 className="text-lg font-semibold mb-2">
                      Posez vos questions sur {selectedAnalysis.name}
                    </h3>
                    <p className="text-base-content/60 mb-6">
                      L'IA analysera les données de ce fichier pour vous répondre
                    </p>

                    {/* Suggestions de questions */}
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-sm font-medium text-base-content/70 mb-3">
                        Exemples de questions :
                      </p>
                      {[
                        'Quel est le revenu total ?',
                        'Quelle est la tendance des ventes ?',
                        'Quelles sont les valeurs aberrantes ?',
                        'Résume les principaux insights',
                      ].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(suggestion)}
                          className="block w-full text-left px-4 py-2 bg-base-200 hover:bg-base-300 rounded-md text-sm transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Liste des messages */
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-success text-success-content'
                              : 'bg-base-200'
                          }`}
                        >
                          {msg.role === 'ai' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles size={16} className="text-success" />
                              <span className="text-xs font-semibold text-success">
                                Assistant IA
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              msg.role === 'user'
                                ? 'text-success-content/70'
                                : 'text-base-content/50'
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Indicateur de chargement */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-base-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="loading loading-dots loading-sm"></span>
                            <span className="text-sm text-base-content/60">
                              L'IA réfléchit...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Référence pour auto-scroll */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Zone de saisie */}
              <div className="border-t border-base-300 p-4 bg-base-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="input input-bordered flex-1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="btn btn-success"
                  >
                    <Send size={18} />
                    Envoyer
                  </button>
                </div>

                {/* Indication contextuelle */}
                <p className="text-xs text-base-content/50 mt-2">
                  💡 Les réponses sont basées uniquement sur l'analyse de{' '}
                  <strong>{selectedAnalysis.name}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    </div>
  );
};