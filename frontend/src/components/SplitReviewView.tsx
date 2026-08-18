import React, { useState } from 'react';
import { DinatInvoiceDocument, LineItem } from '../types/invoice';
import { Check, Eye, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface SplitReviewViewProps {
  documentData: DinatInvoiceDocument;
  pdfUrl?: string;
  onValidateData: (updatedData: DinatInvoiceDocument) => void;
  onReset: () => void;
  onOpenJsonModal: () => void;
}

export const SplitReviewView: React.FC<SplitReviewViewProps> = ({
  documentData,
  pdfUrl,
  onValidateData,
  onReset,
  onOpenJsonModal,
}) => {
  const [formData, setFormData] = useState<DinatInvoiceDocument>(documentData);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    deliveryStatus: true, // First section opened by default!
    header: false,
    client: false,
    items: true,
    totals: true,
    logistics: false,
    authorizations: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleDeliveryStatusChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      delivery_status: { ...prev.delivery_status, [field]: value },
    }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      document_metadata: { ...prev.document_metadata, [field]: value },
    }));
  };

  const handleVendorChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vendor: { ...prev.vendor, [field]: value },
    }));
  };

  const handleClientChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index], [field]: value };

    // Auto-calculate line total if quantity or price changes
    if (field === 'boxes_quantity' || field === 'unit_price') {
      const boxes = field === 'boxes_quantity' ? Number(value) : item.boxes_quantity;
      const price = field === 'unit_price' ? Number(value) : item.unit_price;
      item.total_amount = Number((boxes * price).toFixed(2));
    }

    updatedItems[index] = item;

    // Recalculate subtotal, total boxes, total units
    const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.total_amount, 0);
    const newTotalBoxes = updatedItems.reduce((acc, curr) => acc + (Number(curr.boxes_quantity) || 0), 0);
    const newTotalUnits = updatedItems.reduce((acc, curr) => acc + (Number(curr.total_units) || 0), 0);
    const newIsv = Number((newSubtotal * 0.15).toFixed(2));
    const newGrandTotal = Number((newSubtotal + newIsv).toFixed(2));

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      financial_totals: {
        ...prev.financial_totals,
        total_boxes: newTotalBoxes,
        total_units: newTotalUnits,
        taxable_subtotal: Number(newSubtotal.toFixed(2)),
        tax_isv_15: newIsv,
        grand_total: newGrandTotal,
      },
    }));
  };

  const handleTotalsChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      financial_totals: { ...prev.financial_totals, [field]: Number(value) },
    }));
  };

  const handleLogisticsChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      transport_logistics: { ...prev.transport_logistics, [field]: value },
    }));
  };

  const handleAuthorizationsChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      authorizations: { ...prev.authorizations, [field]: value },
    }));
  };

  // Helper to determine if status has issues
  const isStatusOk =
    formData.delivery_status.status.toUpperCase().includes('SIN PROBLEMA') ||
    formData.delivery_status.status.toUpperCase().includes('COMPLETO') ||
    formData.delivery_status.status.toUpperCase().includes('EXITOSA') ||
    formData.delivery_status.status.toUpperCase().startsWith('SÍ');

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 card-shadow space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-800">
              3. Revisar y editar datos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Completado
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Datos extraídos del PDF mediante LLM. Verifica y ajusta los campos antes de enviar a producción.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenJsonModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Ver JSON</span>
          </button>
        </div>
      </div>

      {/* Info notification */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-3 text-xs text-blue-800">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>
          Por favor revisa los campos extraídos. Puedes editar cualquier valor. Todos los cambios recalcularán automáticamente los totales.
        </span>
      </div>

      {/* Structured Sections */}
      <div className="space-y-4">
        {/* FIRST SECTION: Delivery Status & Recepción (Placed BEFORE Encabezado y Datos del Proveedor!) */}
        <div className={`border rounded-lg overflow-hidden transition-all ${
          isStatusOk ? 'border-emerald-200' : 'border-red-300 ring-2 ring-red-100'
        }`}>
          <button
            onClick={() => toggleSection('deliveryStatus')}
            className={`w-full px-4 py-3 flex justify-between items-center text-sm font-semibold transition-colors ${
              isStatusOk ? 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80' : 'bg-red-50 text-red-900 hover:bg-red-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isStatusOk ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              )}
              <span>Estado de la Entrega y Recepción (Prioridad Auditada)</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ml-2 ${
                isStatusOk ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
              }`}>
                {isStatusOk ? 'Entrega Conforme' : 'Con Incidencia'}
              </span>
            </div>
            {openSections.deliveryStatus ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.deliveryStatus && (
            <div className="p-4 bg-white space-y-4 text-xs">
              {/* Dynamic Status Callout Banner */}
              <div className={`p-3.5 rounded-lg border flex items-start space-x-3 ${
                isStatusOk ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                {isStatusOk ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isStatusOk ? 'Recepción de Producto Exitosa' : 'Atención: Incidencia o Discrepancia Detectada'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isStatusOk
                      ? 'La mercancía fue entregada y recibida conforme según el horario y especificaciones de la tienda.'
                      : 'Revisa cuidadosamente las observaciones de entrega antes de autorizar el envío a Excel.'}
                  </p>
                </div>
              </div>

              {/* Status Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Estado de la Entrega</label>
                  <select
                    value={formData.delivery_status.status}
                    onChange={(e) => handleDeliveryStatusChange('status', e.target.value)}
                    className={`table-input font-bold ${
                      isStatusOk ? 'text-emerald-700 bg-emerald-50/40 border-emerald-300' : 'text-red-700 bg-red-50/40 border-red-300'
                    }`}
                    data-testid="input-delivery-status"
                  >
                    <option value="SÍ - REALIZADA SIN PROBLEMA">SÍ - REALIZADA SIN PROBLEMA</option>
                    <option value="NO - CON PROBLEMAS / FALTANTES">NO - CON PROBLEMAS / FALTANTES</option>
                    <option value="RECHAZADO POR TIENDA">RECHAZADO POR TIENDA</option>
                    <option value="PENDIENTE DE REVISIÓN">PENDIENTE DE REVISIÓN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hora de llegada</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.delivery_status.arrival_time}
                      onChange={(e) => handleDeliveryStatusChange('arrival_time', e.target.value)}
                      className="table-input table-input-with-icon"
                      data-testid="input-arrival-time"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hora de finalización</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.delivery_status.completion_time}
                      onChange={(e) => handleDeliveryStatusChange('completion_time', e.target.value)}
                      className="table-input table-input-with-icon"
                      data-testid="input-completion-time"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Observaciones Textarea */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Observaciones de Recepción / Faltantes</label>
                <textarea
                  rows={2}
                  value={formData.delivery_status.observations}
                  onChange={(e) => handleDeliveryStatusChange('observations', e.target.value)}
                  className="table-input leading-relaxed resize-none"
                  data-testid="input-observations"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 1: Header & Vendor */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('header')}
            className="w-full bg-slate-50 px-4 py-3 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span>1. Encabezado y Datos del Proveedor</span>
            {openSections.header ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.header && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Número de orden / Factura</label>
                <input
                  type="text"
                  value={formData.document_metadata.order_number}
                  onChange={(e) => handleMetadataChange('order_number', e.target.value)}
                  className="table-input"
                  data-testid="input-order-number"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha de emisión</label>
                <input
                  type="date"
                  value={formData.document_metadata.issue_date}
                  onChange={(e) => handleMetadataChange('issue_date', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Moneda</label>
                <select
                  value={formData.document_metadata.currency}
                  onChange={(e) => handleMetadataChange('currency', e.target.value)}
                  className="table-input"
                >
                  <option value="HNL">HNL - Lempira</option>
                  <option value="USD">USD - Dólar US</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre Proveedor</label>
                <input
                  type="text"
                  value={formData.vendor.company_name}
                  onChange={(e) => handleVendorChange('company_name', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">RTN Proveedor</label>
                <input
                  type="text"
                  value={formData.vendor.rtn}
                  onChange={(e) => handleVendorChange('rtn', e.target.value)}
                  className="table-input"
                  data-testid="input-vendor-rtn"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Marca / Marca Comercial</label>
                <input
                  type="text"
                  value={formData.vendor.brand}
                  onChange={(e) => handleVendorChange('brand', e.target.value)}
                  className="table-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Client & Geolocation */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('client')}
            className="w-full bg-slate-50 px-4 py-3 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span>2. Datos del Cliente y Geolocalización</span>
            {openSections.client ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.client && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Razón Social Cliente</label>
                <input
                  type="text"
                  value={formData.client.company_name}
                  onChange={(e) => handleClientChange('company_name', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">RTN Cliente</label>
                <input
                  type="text"
                  value={formData.client.rtn}
                  onChange={(e) => handleClientChange('rtn', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Código de Tienda</label>
                <input
                  type="text"
                  value={formData.client.store_code}
                  onChange={(e) => handleClientChange('store_code', e.target.value)}
                  className="table-input"
                  data-testid="input-store-code"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Tienda / Sucursal</label>
                <input
                  type="text"
                  value={formData.client.store_name}
                  onChange={(e) => handleClientChange('store_name', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Coordenadas Lat / Long</label>
                <input
                  type="text"
                  readOnly
                  value={`${formData.client.coordinates.latitude}, ${formData.client.coordinates.longitude}`}
                  className="table-input bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Contacto Tienda</label>
                <input
                  type="text"
                  value={formData.client.store_contact}
                  onChange={(e) => handleClientChange('store_contact', e.target.value)}
                  className="table-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Editable Line Items Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('items')}
            className="w-full bg-slate-50 px-4 py-3 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span>3. Detalle de Productos (Líneas del Documento)</span>
            {openSections.items ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.items && (
            <div className="p-4 bg-white overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2 min-w-[90px]">Código</th>
                    <th className="p-2 min-w-[160px]">Descripción</th>
                    <th className="p-2 min-w-[90px]">Sabor</th>
                    <th className="p-2 min-w-[130px]">Presentación</th>
                    <th className="p-2 min-w-[70px] text-right">Cajas</th>
                    <th className="p-2 min-w-[80px] text-right">Unidades</th>
                    <th className="p-2 min-w-[90px] text-right">Precio Box</th>
                    <th className="p-2 min-w-[100px] text-right">Total Línea</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => handleItemChange(idx, 'code', e.target.value)}
                          className="table-input text-xs"
                          data-testid={`item-code-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="table-input text-xs"
                          data-testid={`item-desc-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.flavor}
                          onChange={(e) => handleItemChange(idx, 'flavor', e.target.value)}
                          className="table-input text-xs"
                          data-testid={`item-flavor-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.package_type}
                          onChange={(e) => handleItemChange(idx, 'package_type', e.target.value)}
                          className="table-input text-xs"
                          data-testid={`item-pkg-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.boxes_quantity}
                          onChange={(e) => handleItemChange(idx, 'boxes_quantity', Number(e.target.value))}
                          className="table-input text-xs text-right font-medium"
                          data-testid={`item-boxes-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.total_units}
                          onChange={(e) => handleItemChange(idx, 'total_units', Number(e.target.value))}
                          className="table-input text-xs text-right font-medium"
                          data-testid={`item-units-${idx}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', Number(e.target.value))}
                          className="table-input text-xs text-right font-medium"
                          data-testid={`item-price-${idx}`}
                        />
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-800">
                        L {item.total_amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 4: Summary & Totals */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('totals')}
            className="w-full bg-slate-50 px-4 py-3 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span>4. Resumen y Totales Financieros</span>
            {openSections.totals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.totals && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 text-xs bg-white">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Total de Cajas Despachadas</label>
                <input
                  type="number"
                  value={formData.financial_totals.total_boxes}
                  onChange={(e) => handleTotalsChange('total_boxes', Number(e.target.value))}
                  className="table-input font-semibold text-slate-800"
                  data-testid="input-total-boxes"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Total de Unidades Despachadas</label>
                <input
                  type="number"
                  value={formData.financial_totals.total_units}
                  onChange={(e) => handleTotalsChange('total_units', Number(e.target.value))}
                  className="table-input font-semibold text-slate-800"
                  data-testid="input-total-units"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Subtotal Gravable (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.financial_totals.taxable_subtotal}
                  onChange={(e) => handleTotalsChange('taxable_subtotal', Number(e.target.value))}
                  className="table-input font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ISV 15% (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.financial_totals.tax_isv_15}
                  onChange={(e) => handleTotalsChange('tax_isv_15', Number(e.target.value))}
                  className="table-input font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Gran Total (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.financial_totals.grand_total}
                  onChange={(e) => handleTotalsChange('grand_total', Number(e.target.value))}
                  className="table-input font-bold text-blue-700 bg-blue-50/50"
                  data-testid="input-grand-total"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Logistics */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('logistics')}
            className="w-full bg-slate-50 px-4 py-3 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span>5. Transporte y Logística</span>
            {openSections.logistics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.logistics && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-white">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre Conductor</label>
                <input
                  type="text"
                  value={formData.transport_logistics.driver_name}
                  onChange={(e) => handleLogisticsChange('driver_name', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ID Empleado</label>
                <input
                  type="text"
                  value={formData.transport_logistics.employee_id}
                  onChange={(e) => handleLogisticsChange('employee_id', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Ruta Asignada (Auditoría)</label>
                <input
                  type="text"
                  value={formData.transport_logistics.assigned_route}
                  onChange={(e) => handleLogisticsChange('assigned_route', e.target.value)}
                  className="table-input font-medium bg-amber-50/40 border-amber-300"
                  data-testid="input-assigned-route"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Unidad / Placa</label>
                <input
                  type="text"
                  value={formData.transport_logistics.transport_unit}
                  onChange={(e) => handleLogisticsChange('transport_unit', e.target.value)}
                  className="table-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Authorizations */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('authorizations')}
            className="w-full bg-slate-50 px-4 py-3 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span>6. Firmas y Autorizaciones</span>
            {openSections.authorizations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSections.authorizations && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Despachado Por</label>
                <input
                  type="text"
                  value={formData.authorizations.dispatched_by}
                  onChange={(e) => handleAuthorizationsChange('dispatched_by', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Recibido Por</label>
                <input
                  type="text"
                  value={formData.authorizations.received_by}
                  onChange={(e) => handleAuthorizationsChange('received_by', e.target.value)}
                  className="table-input"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Autorizado Por</label>
                <input
                  type="text"
                  value={formData.authorizations.authorized_by}
                  onChange={(e) => handleAuthorizationsChange('authorized_by', e.target.value)}
                  className="table-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Volver a cargar</span>
        </button>

        <button
          onClick={() => onValidateData(formData)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md transition-colors w-full sm:w-auto justify-center"
          data-testid="btn-validate-data"
        >
          <Check className="w-4 h-4" />
          <span>Validar datos</span>
        </button>
      </div>
    </div>
  );
};
