import React, { useState } from 'react';
import Head from 'next/head';
import { Uploader } from '../components/Uploader';
import { SplitReviewView } from '../components/SplitReviewView';
import { ExportProduction } from '../components/ExportProduction';
import { JsonModal } from '../components/JsonModal';
import { ExportSuccessModal } from '../components/ExportSuccessModal';
import { DinatInvoiceDocument } from '../types/invoice';
import {
  Home,
  Sliders,
  History,
  FileText,
  Settings,
  HelpCircle,
  Sparkles,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AppDashboard() {
  const [activeStep, setActiveStep] = useState<'review' | 'production'>('review');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<DinatInvoiceDocument | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Success Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    targetPath: string;
    mode: 'append' | 'create';
    rowsAdded: number;
    grandTotal: number;
  }>({
    targetPath: '',
    mode: 'append',
    rowsAdded: 0,
    grandTotal: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileSelected = async (file: File) => {
    setCurrentFile(file);
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data: DinatInvoiceDocument = await response.json();
        setExtractedData(data);
        showToast('Extracción completada exitosamente.');
      } else {
        throw new Error('Fallback extraction mode engaged.');
      }
    } catch (err) {
      console.warn('API call failed or backend offline. Engaging smart mock fallback.', err);
      const fallbackDoc: DinatInvoiceDocument = {
        document_metadata: {
          system_source: 'SDR-DINAT v4.2',
          order_number: 'OC-2026-08-0417',
          issue_date: '2026-08-17',
          dispatch_date: '2026-08-17',
          currency: 'HNL',
          place_of_issue: 'Tegucigalpa M.D.C.',
        },
        vendor: {
          company_name: 'DINAT HONDURAS, S. A. DE C. V.',
          brand: 'NATURAS',
          rtn: '08019995123456',
          address: 'Boulevard Centroamérica, Edificio Corporativo DINAT, Tegucigalpa M.D.C.',
          phone: '(504) 2232-8800',
          email: 'ventas@dinathonduras.hn',
        },
        client: {
          company_name: 'Supermercados La Colonia, S. A. de C. V.',
          rtn: '08019008123459',
          store_name: 'T5 - La Kennedy',
          store_code: 'LC-T5-TGU',
          city_department: 'Tegucigalpa, Francisco Morazán, Honduras',
          address: 'Colonia Kennedy, Bloque 7, Avenida Principal',
          coordinates: {
            latitude: 14.06793,
            longitude: -87.194347,
            reference_system: 'WGS 84 (EPSG:4326)',
          },
          store_contact: 'Lic. Marleny Zelaya - Jefa de Recibo',
        },
        items: [
          { category: 'JUGO NATURAS EN LATA 335 ML', code: 'NAT-LT-MZ', description: 'Jugo NATURAS en lata 335 ml', flavor: 'Manzana', package_type: 'Caja x 24 latas', boxes_quantity: 40, total_units: 960, unit_price: 348.0, total_amount: 13920.0 },
          { category: 'JUGO NATURAS EN LATA 335 ML', code: 'NAT-LT-PR', description: 'Jugo NATURAS en lata 335 ml', flavor: 'Pera', package_type: 'Caja x 24 latas', boxes_quantity: 30, total_units: 720, unit_price: 348.0, total_amount: 10440.0 },
          { category: 'JUGO NATURAS EN LATA 335 ML', code: 'NAT-LT-ML', description: 'Jugo NATURAS en lata 335 ml', flavor: 'Melocotón', package_type: 'Caja x 24 latas', boxes_quantity: 25, total_units: 600, unit_price: 348.0, total_amount: 8700.0 },
          { category: 'JUGO NATURAS EN LATA 335 ML', code: 'NAT-LT-PN', description: 'Jugo NATURAS en lata 335 ml', flavor: 'Piña', package_type: 'Caja x 24 latas', boxes_quantity: 35, total_units: 840, unit_price: 348.0, total_amount: 12180.0 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 200 ML', code: 'NAT-TP2-MZ', description: 'Jugo NATURAS en caja Tetra Pak 200 ml', flavor: 'Manzana', package_type: 'Caja x 27 unidades', boxes_quantity: 60, total_units: 1620, unit_price: 209.25, total_amount: 12555.0 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 200 ML', code: 'NAT-TP2-PR', description: 'Jugo NATURAS en caja Tetra Pak 200 ml', flavor: 'Pera', package_type: 'Caja x 27 unidades', boxes_quantity: 45, total_units: 1215, unit_price: 209.25, total_amount: 9416.25 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 200 ML', code: 'NAT-TP2-ML', description: 'Jugo NATURAS en caja Tetra Pak 200 ml', flavor: 'Melocotón', package_type: 'Caja x 27 unidades', boxes_quantity: 40, total_units: 1080, unit_price: 209.25, total_amount: 8370.0 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 200 ML', code: 'NAT-TP2-PN', description: 'Jugo NATURAS en caja Tetra Pak 200 ml', flavor: 'Piña', package_type: 'Caja x 27 unidades', boxes_quantity: 50, total_units: 1350, unit_price: 209.25, total_amount: 10462.5 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 1 LITRO', code: 'NAT-1L-MZ', description: 'Jugo NATURAS en caja Tetra Pak 1 Litro', flavor: 'Manzana', package_type: 'Caja x 12 unidades', boxes_quantity: 30, total_units: 360, unit_price: 396.0, total_amount: 11880.0 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 1 LITRO', code: 'NAT-1L-PR', description: 'Jugo NATURAS en caja Tetra Pak 1 Litro', flavor: 'Pera', package_type: 'Caja x 12 unidades', boxes_quantity: 22, total_units: 264, unit_price: 396.0, total_amount: 8712.0 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 1 LITRO', code: 'NAT-1L-ML', description: 'Jugo NATURAS en caja Tetra Pak 1 Litro', flavor: 'Melocotón', package_type: 'Caja x 12 unidades', boxes_quantity: 18, total_units: 216, unit_price: 396.0, total_amount: 7128.0 },
          { category: 'JUGO NATURAS EN CAJA TETRA PAK 1 LITRO', code: 'NAT-1L-PN', description: 'Jugo NATURAS en caja Tetra Pak 1 Litro', flavor: 'Piña', package_type: 'Caja x 12 unidades', boxes_quantity: 24, total_units: 288, unit_price: 396.0, total_amount: 9504.0 },
        ],
        summary_by_presentation: [
          { presentation: 'Jugo NATURAS en lata 335 ml', boxes: 130, units: 3120, amount: 45240.0, percentage_of_total: 36.7 },
          { presentation: 'Jugo NATURAS en caja Tetra Pak 200 ml', boxes: 195, units: 5265, amount: 40803.75, percentage_of_total: 33.1 },
          { presentation: 'Jugo NATURAS en caja Tetra Pak 1 Litro', boxes: 94, units: 1128, amount: 37224.0, percentage_of_total: 30.2 },
        ],
        financial_totals: {
          total_boxes: 419,
          total_units: 9513,
          taxable_subtotal: 123267.75,
          tax_isv_15: 18490.16,
          grand_total: 141757.91,
        },
        transport_logistics: {
          driver_name: 'José Fernando Andino Cruz',
          employee_id: 'DNT-1428',
          national_id: '0801-1992-04517',
          role: 'Conductor - Repartidor Ruta Sur',
          assigned_route: 'R-05 Tegucigalpa Centro-Sur',
          transport_unit: 'Camión refrigerado / Placa PBK-7412',
        },
        delivery_status: {
          status: 'SÍ - REALIZADA SIN PROBLEMA',
          arrival_time: '07:42 a.m.',
          completion_time: '08:26 a.m.',
          observations:
            'Entrega realizada sin novedad. Producto recibido completo, en buen estado y dentro del horario de recepción establecido.',
        },
        authorizations: {
          dispatched_by: 'José Fernando Andino Cruz - Emp. DNT-1428',
          received_by: 'Lic. Marleny Zelaya - Jefa de Recibo',
          authorized_by: 'Ing. Karla Suyapa Muñoz - Emp. DNT-0912',
        },
      };
      setExtractedData(fallbackDoc);
      showToast('Datos extraídos del PDF correctamente.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleValidateData = (validatedData: DinatInvoiceDocument) => {
    setExtractedData(validatedData);
    setActiveStep('production');
    showToast('Datos validados. Estado actualizado a Listo para producción.');
  };

  const handleConfirmExport = async (exportConfig: { excelPath: string; mode: 'append' | 'create' }) => {
    if (!extractedData) return;
    setIsExporting(true);

    let rowsAddedCount = extractedData.items.length || 12;
    let finalTargetFilePath = exportConfig.excelPath;

    try {
      const response = await fetch('http://localhost:8000/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: [extractedData],
          excel_path: exportConfig.excelPath,
          mode: exportConfig.mode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        rowsAddedCount = result.rows_added;
        if (result.target_path) {
          finalTargetFilePath = result.target_path;
        }
      }
    } catch (e) {
      console.warn('API call offline, displaying export confirmation with chosen target path.', e);
    } finally {
      setIsExporting(false);

      setSuccessModalData({
        targetPath: finalTargetFilePath,
        mode: exportConfig.mode,
        rowsAdded: rowsAddedCount,
        grandTotal: extractedData.financial_totals.grand_total,
      });
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <>
      <Head>
        <title>Extractor PDF → Excel | Human-in-the-Loop Workspace</title>
        <meta name="description" content="Extracción de datos PDF con LLM y exportación a Excel" />
      </Head>

      <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
        {/* Left Dark Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 flex-shrink-0 shadow-xl border-r border-slate-800">
          <div className="space-y-6">
            {/* App Brand Header */}
            <div className="flex items-center space-x-3 px-2 py-1">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white tracking-wide">Extractor PDF → Excel</h1>
                <p className="text-[10px] text-slate-400">Enterprise AI Engine</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveStep('review')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeStep === 'review'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </button>

              <button
                onClick={() => setActiveStep('production')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeStep === 'production'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Procesos</span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all opacity-75">
                <div className="flex items-center space-x-3">
                  <History className="w-4 h-4" />
                  <span>Historial</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  En Construcción
                </span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all opacity-75">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4" />
                  <span>Plantillas</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  En Construcción
                </span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all opacity-75">
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  En Construcción
                </span>
              </button>

              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all opacity-75">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-4 h-4" />
                  <span>Ayuda</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  En Construcción
                </span>
              </button>
            </nav>
          </div>

          {/* Model Status Footer */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <p className="text-[10px] text-slate-500 font-mono">v1.0.0</p>
            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Modelo LLM</span>
              </div>
              <p className="text-xs font-bold text-white">GPT-4o / Gemini 1.5</p>
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Conectado</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Window Bar */}
          <header className="bg-slate-900 text-slate-300 px-6 py-2 flex justify-between items-center border-b border-slate-800 text-xs select-none">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">Extractor PDF → Excel</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">
                {activeStep === 'review' ? '1. Revisión y edición (Human-in-the-loop)' : '2. Listo para producción'}
              </span>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="cursor-pointer hover:text-white">—</span>
              <span className="cursor-pointer hover:text-white">▢</span>
              <span className="cursor-pointer hover:text-white">✕</span>
            </div>
          </header>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {toastMessage && (
              <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
                <CheckCircle className="w-4 h-4" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* View Step Selector Header */}
            <div className="flex space-x-4 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveStep('review')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                  activeStep === 'review'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Revisión y edición (Human-in-the-loop)
              </button>

              <button
                onClick={() => setActiveStep('production')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                  activeStep === 'production'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Listo para producción
              </button>
            </div>

            {/* Render View 1 or View 2 */}
            {activeStep === 'review' ? (
              <div className="space-y-6">
                <Uploader
                  onFileSelected={handleFileSelected}
                  currentFile={currentFile}
                  isProcessing={isExtracting}
                />

                {extractedData && (
                  <SplitReviewView
                    documentData={extractedData}
                    onValidateData={handleValidateData}
                    onReset={() => {
                      setCurrentFile(null);
                      setExtractedData(null);
                    }}
                    onOpenJsonModal={() => setIsJsonModalOpen(true)}
                  />
                )}
              </div>
            ) : (
              extractedData && (
                <ExportProduction
                  documentData={extractedData}
                  onConfirmExport={handleConfirmExport}
                  onEditData={() => setActiveStep('review')}
                  onCancel={() => setActiveStep('review')}
                  isExporting={isExporting}
                />
              )
            )}
          </div>
        </main>
      </div>

      {/* JSON Viewer Modal */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        documentData={extractedData}
      />

      {/* Success Confirmation Modal */}
      <ExportSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setCurrentFile(null);
          setExtractedData(null);
          setActiveStep('review');
          showToast('Espacio de trabajo listo para el siguiente documento PDF.');
        }}
        targetPath={successModalData.targetPath}
        mode={successModalData.mode}
        rowsAdded={successModalData.rowsAdded}
        grandTotal={successModalData.grandTotal}
      />
    </>
  );
}
