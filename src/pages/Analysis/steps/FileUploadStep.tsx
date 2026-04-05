/**
 * ÉTAPE 1 : SÉLECTION DU FICHIER EXCEL
<<<<<<< HEAD
 */

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { analysisApi, FileValidationResponse } from '../api/analysisApi';
import { useAuth } from '../../../hooks/useAuth';

interface FileUploadStepProps {
  onFileValidated: (file: File, validation: FileValidationResponse) => void;
  onRequestAuth: () => void;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onFileValidated,
  onRequestAuth
}) => {
  const { isAuthenticated } = useAuth();

=======
 * 
 * Permet à l'utilisateur de sélectionner un fichier Excel/CSV.
 * Affiche les informations du fichier et valide le format.
 */

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { analysisApi, FileValidationResponse } from '../api/analysisApi';

interface FileUploadStepProps {
  onFileValidated: (file: File, validation: FileValidationResponse) => void;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({ onFileValidated }) => {
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<FileValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

<<<<<<< HEAD
  const handleFileSelect = async (selectedFile: File) => {
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }

=======
  /**
   * Gestion de la sélection de fichier
   */
  const handleFileSelect = async (selectedFile: File) => {
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
    setFile(selectedFile);
    setValidation(null);
    setIsValidating(true);

    try {
      const result = await analysisApi.validateFile(selectedFile);
      setValidation(result);
<<<<<<< HEAD
=======

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      if (result.valid) {
        onFileValidated(selectedFile, result);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

<<<<<<< HEAD
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAuthenticated) {
      onRequestAuth();
      return;
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  // ============================================================
  // CAS : NON CONNECTÉ
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Sélectionnez votre fichier Excel</h2>
          <p className="text-base-content/70">
            Formats acceptés : .xlsx, .xls, .csv (max 10 Mo)
          </p>
        </div>

        <div className="relative">
          {/* Zone désactivée en arrière-plan */}
          <div className="border-2 border-dashed rounded-lg p-12 text-center border-base-300 opacity-40 pointer-events-none select-none">
            <Upload className="mx-auto mb-4 text-base-content/40" size={48} />
            <h3 className="text-lg font-semibold mb-2">Glissez-déposez votre fichier</h3>
            <p className="text-base-content/60 mb-4">ou</p>
            <div className="btn btn-success opacity-50">Parcourir les fichiers</div>
          </div>

          {/* Overlay connexion */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-base-100/80 backdrop-blur-sm">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-2">
                <LogIn className="text-success" size={32} />
              </div>
              <h3 className="text-xl font-bold">Connexion requise</h3>
              <p className="text-base-content/70 max-w-xs">
                Vous devez être connecté pour analyser un fichier Excel.
              </p>
              <button
                onClick={onRequestAuth}
                className="btn btn-success"
              >
                <LogIn size={18} />
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // CAS : CONNECTÉ
  // ============================================================
=======
  /**
   * Gestion du drag & drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sélectionnez votre fichier Excel</h2>
        <p className="text-base-content/70">
          Formats acceptés : .xlsx, .xls, .csv (max 10 Mo)
        </p>
      </div>

<<<<<<< HEAD
=======
      {/* Zone de drop */}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-success bg-success/5' : 'border-base-300'
          }`}
        >
          <Upload className="mx-auto mb-4 text-base-content/40" size={48} />
          <h3 className="text-lg font-semibold mb-2">Glissez-déposez votre fichier</h3>
          <p className="text-base-content/60 mb-4">ou</p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
<<<<<<< HEAD
          <label htmlFor="file-upload" className="btn btn-success cursor-pointer">
=======
          <label htmlFor="file-upload" className="btn btn-success">
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
            Parcourir les fichiers
          </label>
        </div>
      )}

<<<<<<< HEAD
=======
      {/* Fichier sélectionné */}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
      {file && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <FileSpreadsheet className="text-success flex-shrink-0 mt-1" size={32} />
                <div>
                  <h3 className="font-semibold text-lg">{file.name}</h3>
                  <p className="text-sm text-base-content/60">
                    Taille : {(file.size / 1024).toFixed(2)} Ko
                  </p>

                  {validation && (
                    <div className="mt-3">
                      {validation.valid ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle2 size={18} />
                          <span className="text-sm font-medium">Fichier valide</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {validation.errors?.map((error, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-error">
                              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{error}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
<<<<<<< HEAD
                onClick={() => { setFile(null); setValidation(null); }}
=======
                onClick={() => {
                  setFile(null);
                  setValidation(null);
                }}
>>>>>>> fb232e57f9317dd922dada12a956e55d7fd256c3
                className="btn btn-ghost btn-sm"
              >
                Changer
              </button>
            </div>

            {isValidating && (
              <div className="mt-4 flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-sm text-base-content/60">Validation en cours...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};