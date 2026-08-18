import React, { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Copy, Check, X, ArrowRight, Folder } from 'lucide-react';

interface ExportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPath: string;
  mode: 'append' | 'create';
  rowsAdded: number;
  grandTotal: number;
}

export const ExportSuccessModal: React.FC<ExportSuccessModalProps> = ({
  isOpen,
  onClose,
  targetPath,
  mode,
  rowsAdded,
  grandTotal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayPath = targetPath || 'c:\\dev\\agentic\\exports\\Registros_Facturas_2026.xlsx';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(displayPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transform transition-all scale-100">
        {/* Header Bar */}
        <div className="bg-emerald-600 px-6 py-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/30 rounded-full blur-xl pointer-events-none"></div>

          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">¡Archivo Excel Generado!</h3>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Los datos han sido validados y guardados exitosamente en producción.
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-white text-xs">
          {/* File Path Card (No truncation! Full address line wraps cleanly) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <Folder className="w-4 h-4 text-emerald-600" />
              <span>Ruta del Archivo Generado</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-start space-x-2.5 w-full min-w-0">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-slate-800 text-xs font-semibold break-all leading-relaxed select-all">
                  {displayPath}
                </span>
              </div>

              <button
                onClick={handleCopyPath}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors flex-shrink-0 border border-slate-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Ruta'}</span>
              </button>
            </div>
          </div>

          {/* Details Summary Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="block text-slate-400 font-medium text-[10px]">Acción</span>
              <span className="font-bold text-slate-800 text-xs">
                {mode === 'append' ? 'Append (Anexar)' : 'Nuevo Archivo'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="block text-slate-400 font-medium text-[10px]">Filas Agregadas</span>
              <span className="font-bold text-emerald-600 text-sm">{rowsAdded} productos</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="block text-slate-400 font-medium text-[10px]">Gran Total</span>
              <span className="font-bold text-slate-900 text-xs">
                L {grandTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-md transition-colors"
          >
            <span>Entendido / Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
