/**
 * ÉTAPE 1 : SÉLECTION DU FICHIER EXCEL
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
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<FileValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Gestion de la sélection de fichier
   */
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setValidation(null);
    setIsValidating(true);

    try {
      const result = await analysisApi.validateFile(selectedFile);
      setValidation(result);

      if (result.valid) {
        onFileValidated(selectedFile, result);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sélectionnez votre fichier Excel</h2>
        <p className="text-base-content/70">
          Formats acceptés : .xlsx, .xls, .csv (max 10 Mo)
        </p>
      </div>

      {/* Zone de drop */}
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
          <label htmlFor="file-upload" className="btn btn-success">
            Parcourir les fichiers
          </label>
        </div>
      )}

      {/* Fichier sélectionné */}
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
                onClick={() => {
                  setFile(null);
                  setValidation(null);
                }}
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