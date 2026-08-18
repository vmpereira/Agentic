import React, { useState, useRef } from 'react';
import { DinatInvoiceDocument } from '../types/invoice';
import { CheckCircle2, FileSpreadsheet, Edit3, ArrowRight, FolderOpen, Save } from 'lucide-react';

interface ExportProductionProps {
  documentData: DinatInvoiceDocument;
  onConfirmExport: (exportConfig: { excelPath: string; mode: 'append' | 'create'; fileHandle?: any }) => void;
  onEditData: () => void;
  onCancel: () => void;
  isExporting?: boolean;
}

export const ExportProduction: React.FC<ExportProductionProps> = ({
  documentData,
  onConfirmExport,
  onEditData,
  onCancel,
  isExporting = false,
}) => {
  const [excelPath, setExcelPath] = useState<string>('c:\\dev\\agentic\\exports\\Registros_Facturas_2026.xlsx');
  const [mode, setMode] = useState<'append' | 'create'>('append');
  const [fileHandle, setFileHandle] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    onConfirmExport({ excelPath, mode, fileHandle });
  };

  const handleModeChange = (newMode: 'append' | 'create') => {
    setMode(newMode);
    if (newMode === 'create' && !excelPath.includes('Nuevo_')) {
      const dir = excelPath.includes('\\')
        ? excelPath.substring(0, excelPath.lastIndexOf('\\') + 1)
        : excelPath.includes('/')
        ? excelPath.substring(0, excelPath.lastIndexOf('/') + 1)
        : 'c:\\dev\\agentic\\exports\\';
      const name = excelPath.includes('\\')
        ? excelPath.substring(excelPath.lastIndexOf('\\') + 1)
        : excelPath.includes('/')
        ? excelPath.substring(excelPath.lastIndexOf('/') + 1)
        : excelPath;
      setExcelPath(`${dir}Nuevo_${name}`);
    } else if (newMode === 'append' && excelPath.includes('Nuevo_')) {
      setExcelPath(excelPath.replace('Nuevo_', ''));
    }
  };

  const handleOpenFileDialog = async () => {
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

    if (mode === 'append') {
      // 1. ELECTRON SHELL MODE -> Returns real full OS path (e.g. C:\Users\...\report.xlsx)
      if (isElectron && (window as any).electronAPI.selectExcelFile) {
        try {
          const selectedPath = await (window as any).electronAPI.selectExcelFile();
          if (selectedPath) {
            setExcelPath(selectedPath);
            setFileHandle(null);
            return;
          }
        } catch (err) {
          console.warn('Electron OpenFileDialog error:', err);
        }
      }

      // 2. PURE BROWSER MODE -> FileSystemAccess API (showOpenFilePicker)
      if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
        try {
          const [handle] = await (window as any).showOpenFilePicker({
            types: [
              {
                description: 'Excel Workbook (*.xlsx, *.xls)',
                accept: {
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.ms-excel': ['.xls'],
                },
              },
            ],
            multiple: false,
          });

          if (handle && handle.name) {
            setFileHandle(handle);
            // In pure browser mode, browser security hides absolute OS path (file.path is undefined).
            // Combine default export directory with handle.name for backend processing
            const baseDir = excelPath.includes('\\')
              ? excelPath.substring(0, excelPath.lastIndexOf('\\') + 1)
              : 'c:\\dev\\agentic\\exports\\';
            setExcelPath(`${baseDir}${handle.name}`);
            return;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') return; // User cancelled dialog
          console.warn('showOpenFilePicker error:', err);
        }
      }

      // Browser Fallback <input type="file">
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    } else {
      // 1. ELECTRON SHELL MODE -> Returns real full OS save path
      if (isElectron && (window as any).electronAPI.selectSaveExcelFile) {
        try {
          const defaultName = excelPath.includes('\\')
            ? excelPath.substring(excelPath.lastIndexOf('\\') + 1)
            : 'Nuevo_Registro_Facturas.xlsx';
          const savedPath = await (window as any).electronAPI.selectSaveExcelFile(defaultName);
          if (savedPath) {
            setExcelPath(savedPath);
            setFileHandle(null);
            return;
          }
        } catch (err) {
          console.warn('Electron SaveFileDialog error:', err);
        }
      }

      // 2. PURE BROWSER MODE -> FileSystemAccess API (showSaveFilePicker)
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const defaultName = excelPath.includes('\\')
            ? excelPath.substring(excelPath.lastIndexOf('\\') + 1)
            : 'Nuevo_Registro_Facturas.xlsx';
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: defaultName,
            types: [
              {
                description: 'Excel Workbook (*.xlsx)',
                accept: {
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                },
              },
            ],
          });

          if (handle && handle.name) {
            setFileHandle(handle);
            // In pure browser mode, browser security hides absolute OS path.
            // Combine default export directory with handle.name for backend processing
            const baseDir = excelPath.includes('\\')
              ? excelPath.substring(0, excelPath.lastIndexOf('\\') + 1)
              : 'c:\\dev\\agentic\\exports\\';
            setExcelPath(`${baseDir}${handle.name}`);
            return;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') return; // User cancelled dialog
          console.warn('showSaveFilePicker error:', err);
        }
      }

      // Browser Fallback <input type="file">
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fullPath = (file as any).path;
      if (fullPath) {
        setExcelPath(fullPath);
      } else {
        const baseDir = excelPath.includes('\\')
          ? excelPath.substring(0, excelPath.lastIndexOf('\\') + 1)
          : 'c:\\dev\\agentic\\exports\\';
        setExcelPath(`${baseDir}${file.name}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 card-shadow space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">2. Listo para producción</h2>

      {/* Progress Stepper */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Resumen del proceso
        </p>

        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-emerald-500 -translate-y-1/2 -z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center z-10 bg-slate-50 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-600 font-medium mt-1.5">PDF cargado</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10 bg-slate-50 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-600 font-medium mt-1.5">Datos extraídos</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10 bg-slate-50 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-600 font-medium mt-1.5">Datos revisados</span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center z-10 bg-slate-50 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-blue-100">
              4
            </div>
            <span className="text-xs text-blue-700 font-semibold mt-1.5">Listo para producción</span>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center space-x-3 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-900">Los datos están validados y listos para ser enviados a Excel.</p>
            <p className="text-emerald-700 font-normal">Revisa el resumen antes de confirmar.</p>
          </div>
        </div>
      </div>

      {/* Summarized Invoice Data Card */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-800">Datos a guardar</h3>
          <button
            onClick={onEditData}
            className="flex items-center space-x-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar datos</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-slate-400 font-medium">Número de factura / orden</span>
            <span className="font-semibold text-slate-800">{documentData.document_metadata.order_number}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Fecha de emisión</span>
            <span className="font-semibold text-slate-800">{documentData.document_metadata.issue_date}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Proveedor</span>
            <span className="font-semibold text-slate-800">{documentData.vendor.company_name}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">RTN / RUC</span>
            <span className="font-semibold text-slate-800">{documentData.vendor.rtn}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Total Gran Total</span>
            <span className="font-bold text-slate-900 text-sm">
              L {documentData.financial_totals.grand_total.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Moneda</span>
            <span className="font-semibold text-slate-800">{documentData.document_metadata.currency}</span>
          </div>
          <div className="md:col-span-2">
            <span className="block text-slate-400 font-medium">Observaciones</span>
            <span className="text-slate-600 truncate block">{documentData.delivery_status.observations || 'Sin observaciones'}</span>
          </div>
        </div>
      </div>

      {/* Target Excel Configuration with Interactive Native OS File Dialogs */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800">Excel de destino</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Modo: {mode === 'append' ? 'Anexar (OpenFileDialog)' : 'Crear Nuevo (SaveFileDialog Interactivo)'}
          </span>
        </div>

        {/* Hidden File Picker Input for Browser Fallback */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFilePicked}
          accept=".xlsx,.xls"
          className="hidden"
          data-testid="file-picker-input"
        />

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3 w-full">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="w-full min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-semibold text-slate-800 break-all">
                  {excelPath}
                </p>
                {fileHandle && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    FileHandle Browser Active
                  </span>
                )}
              </div>
              <input
                type="text"
                value={excelPath}
                onChange={(e) => setExcelPath(e.target.value)}
                className="text-xs text-slate-600 bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 w-full font-mono mt-1"
                data-testid="input-excel-path"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {mode === 'append'
                  ? 'Hoja: Facturas | Se anexarán las filas al final del archivo existente'
                  : 'Se creará un nuevo archivo Excel formateado'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenFileDialog}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors flex-shrink-0"
            data-testid="btn-change-file"
          >
            {mode === 'append' ? (
              <>
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                <span>Seleccionar existente (Append)</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-blue-600" />
                <span>Guardar como (SaveFileDialog)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Action Options */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Acción a realizar</h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="append"
              checked={mode === 'append'}
              onChange={() => handleModeChange('append')}
              className="mt-0.5 text-blue-600 focus:ring-blue-500"
              data-testid="radio-append"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Append (agregar al final)</span>
              <span className="text-slate-500">Agrega el registro como una nueva fila al final de la hoja existente. (OpenFileDialog)</span>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="create"
              checked={mode === 'create'}
              onChange={() => handleModeChange('create')}
              className="mt-0.5 text-blue-600 focus:ring-blue-500"
              data-testid="radio-create"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Crear nuevo archivo</span>
              <span className="text-slate-500">Crea un nuevo archivo Excel formateado con los datos. (SaveFileDialog Interactivo)</span>
            </div>
          </label>
        </div>
      </div>

      {/* Confirm Button Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
        >
          Cancelar
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md transition-colors w-full sm:w-auto justify-center disabled:opacity-50"
          data-testid="btn-confirm-export"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{isExporting ? 'Generando Excel...' : 'Confirmar y generar Excel'}</span>
        </button>
      </div>
    </div>
  );
};
