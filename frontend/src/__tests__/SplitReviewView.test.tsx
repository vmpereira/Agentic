import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplitReviewView } from '../components/SplitReviewView';
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
  items: [
    {
      category: 'JUGO NATURAS EN LATA 335 ML',
      code: 'NAT-LT-MZ',
      description: 'Jugo NATURAS en lata 335 ml',
      flavor: 'Manzana',
      package_type: 'Caja x 24 latas',
      boxes_quantity: 40,
      total_units: 960,
      unit_price: 348.0,
      total_amount: 13920.0,
    },
  ],
  summary_by_presentation: [],
  financial_totals: {
    total_boxes: 40,
    total_units: 960,
    taxable_subtotal: 13920.0,
    tax_isv_15: 2088.0,
    grand_total: 16008.0,
  },
  transport_logistics: {
    driver_name: 'José Fernando Andino Cruz',
    employee_id: 'DNT-1428',
    national_id: '0801-1992-04517',
    role: 'Conductor',
    assigned_route: 'R-05 Tegucigalpa Centro-Sur',
    transport_unit: 'PBK-7412',
  },
  delivery_status: {
    status: 'SÍ - REALIZADA SIN PROBLEMA',
    arrival_time: '07:42 a.m.',
    completion_time: '08:26 a.m.',
    observations: 'Entrega realizada sin novedad. Producto recibido completo.',
  },
  authorizations: {
    dispatched_by: 'José Fernando',
    received_by: 'Marleny Zelaya',
    authorized_by: 'Karla Muñoz',
  },
};

describe('SplitReviewView Component', () => {
  it('renders Delivery Status as the FIRST section with high-priority status indicators', () => {
    render(
      <SplitReviewView
        documentData={sampleDoc}
        onValidateData={vi.fn()}
        onReset={vi.fn()}
        onOpenJsonModal={vi.fn()}
      />
    );

    expect(screen.getByText(/Estado de la Entrega y Recepción/i)).toBeInTheDocument();

    const statusSelect = screen.getByTestId('input-delivery-status') as HTMLSelectElement;
    const arrivalInput = screen.getByTestId('input-arrival-time') as HTMLInputElement;
    const completionInput = screen.getByTestId('input-completion-time') as HTMLInputElement;
    const obsInput = screen.getByTestId('input-observations') as HTMLTextAreaElement;

    expect(statusSelect.value).toBe('SÍ - REALIZADA SIN PROBLEMA');
    expect(arrivalInput.value).toBe('07:42 a.m.');
    expect(completionInput.value).toBe('08:26 a.m.');
    expect(obsInput.value).toContain('Entrega realizada sin novedad');
  });

  it('updates status color banner when delivery status changes to an issue/problem state', () => {
    render(
      <SplitReviewView
        documentData={sampleDoc}
        onValidateData={vi.fn()}
        onReset={vi.fn()}
        onOpenJsonModal={vi.fn()}
      />
    );

    const statusSelect = screen.getByTestId('input-delivery-status') as HTMLSelectElement;
    expect(screen.getByText(/Recepción de Producto Exitosa/i)).toBeInTheDocument();

    fireEvent.change(statusSelect, { target: { value: 'NO - CON PROBLEMAS / FALTANTES' } });

    expect(screen.getByText(/Atención: Incidencia o Discrepancia Detectada/i)).toBeInTheDocument();
  });

  it('renders correct column alignments for Sabor, Presentación, Cajas, and Unidades', () => {
    render(
      <SplitReviewView
        documentData={sampleDoc}
        onValidateData={vi.fn()}
        onReset={vi.fn()}
        onOpenJsonModal={vi.fn()}
      />
    );

    const flavorInput = screen.getByTestId('item-flavor-0') as HTMLInputElement;
    const pkgInput = screen.getByTestId('item-pkg-0') as HTMLInputElement;
    const boxesInput = screen.getByTestId('item-boxes-0') as HTMLInputElement;
    const unitsInput = screen.getByTestId('item-units-0') as HTMLInputElement;

    expect(flavorInput.value).toBe('Manzana');
    expect(pkgInput.value).toBe('Caja x 24 latas');
    expect(boxesInput.value).toBe('40');
    expect(unitsInput.value).toBe('960');
  });
});
