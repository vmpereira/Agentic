import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportProduction } from '../components/ExportProduction';
import { DinatInvoiceDocument } from '../types/invoice';

const sampleDoc: DinatInvoiceDocument = {
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
    address: 'Boulevard Centroamérica',
    phone: '2232-8800',
    email: 'ventas@dinathonduras.hn',
  },
  client: {
    company_name: 'Supermercados La Colonia',
    rtn: '08019008123459',
    store_name: 'T5 - La Kennedy',
    store_code: 'LC-T5-TGU',
    city_department: 'Tegucigalpa',
    address: 'Colonia Kennedy',
    coordinates: { latitude: 14.06793, longitude: -87.194347, reference_system: 'WGS 84' },
    store_contact: 'Lic. Marleny Zelaya',
  },
  items: [],
  summary_by_presentation: [],
  financial_totals: {
    total_boxes: 40,
    total_units: 960,
    taxable_subtotal: 13920.0,
    tax_isv_15: 2088.0,
    grand_total: 16008.0,
  },
  transport_logistics: {
    driver_name: 'José Fernando',
    employee_id: 'DNT-1428',
    national_id: '0801',
    role: 'Conductor',
    assigned_route: 'R-05',
    transport_unit: 'PBK-7412',
  },
  delivery_status: {
    status: 'SÍ - REALIZADA SIN PROBLEMA',
    arrival_time: '07:42 a.m.',
    completion_time: '08:26 a.m.',
    observations: 'Sin novedad',
  },
  authorizations: {
    dispatched_by: 'José Fernando',
    received_by: 'Marleny Zelaya',
    authorized_by: 'Karla Muñoz',
  },
};

describe('ExportProduction Component', () => {
  it('toggles mode between Append (OpenFileDialog) and Crear Nuevo (SaveFileDialog)', () => {
    const handleConfirm = vi.fn();
    render(
      <ExportProduction
        documentData={sampleDoc}
        onConfirmExport={handleConfirm}
        onEditData={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const radioAppend = screen.getByTestId('radio-append') as HTMLInputElement;
    const radioCreate = screen.getByTestId('radio-create') as HTMLInputElement;

    expect(radioAppend.checked).toBe(true);
    expect(screen.getByText(/Seleccionar existente \(Append\)/i)).toBeInTheDocument();

    fireEvent.click(radioCreate);

    expect(radioCreate.checked).toBe(true);
    expect(screen.getByText(/Guardar como \(Nuevo Excel\)/i)).toBeInTheDocument();
  });

  it('triggers onConfirmExport with current target path and selected mode', () => {
    const handleConfirm = vi.fn();
    render(
      <ExportProduction
        documentData={sampleDoc}
        onConfirmExport={handleConfirm}
        onEditData={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const btnConfirm = screen.getByTestId('btn-confirm-export');
    fireEvent.click(btnConfirm);

    expect(handleConfirm).toHaveBeenCalledWith({
      excelPath: expect.stringContaining('Registros_Facturas_2026.xlsx'),
      mode: 'append',
    });
  });
});
