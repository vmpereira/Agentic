import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface UploaderProps {
  onFileSelected: (file: File) => void;
  currentFile?: File | null;
  pageCount?: number;
  isProcessing?: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({
  onFileSelected,
  currentFile,
  pageCount = 2,
  isProcessing = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelected(file);
      } else {
        alert('Por favor selecciona un archivo PDF válido.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 card-shadow mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Cargar PDF</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div
          data-testid="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-blue-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
            data-testid="pdf-file-input"
          />

          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-medium text-slate-700 mb-1">
            Arrastra y suelta un archivo PDF aquí
          </p>
          <p className="text-xs text-slate-400 mb-4">o</p>

          <button
            type="button"
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            Seleccionar archivo
          </button>
        </div>

        {/* Selected File Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          {currentFile ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                  PDF
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-800 truncate" title={currentFile.name}>
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(currentFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Páginas:</span>
                  <span className="font-semibold text-slate-800">{pageCount}</span>
                </div>

                <div className="flex items-center space-x-2 text-emerald-600 text-xs font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PDF válido</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6">
              <FileText className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs text-center">Ningún archivo cargado</p>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center space-x-2 text-blue-600 text-xs font-medium">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando datos con LLM...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
