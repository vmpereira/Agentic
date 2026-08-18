export interface DocumentMetadata {
  system_source: string;
  order_number: string;
  issue_date: string;
  dispatch_date: string;
  currency: string;
  place_of_issue: string;
}

export interface Vendor {
  company_name: string;
  brand: string;
  rtn: string;
  address: string;
  phone: string;
  email: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  reference_system: string;
}

export interface Client {
  company_name: string;
  rtn: string;
  store_name: string;
  store_code: string;
  city_department: string;
  address: string;
  coordinates: GeoCoordinates;
  store_contact: string;
}

export interface LineItem {
  category: string;
  code: string;
  description: string;
  flavor: string;
  package_type: string;
  boxes_quantity: number;
  total_units: number;
  unit_price: number;
  total_amount: number;
}

export interface SummaryByPresentation {
  presentation: string;
  boxes: number;
  units: number;
  amount: number;
  percentage_of_total: number;
}

export interface FinancialTotals {
  total_boxes: number;
  total_units: number;
  taxable_subtotal: number;
  tax_isv_15: number;
  grand_total: number;
}

export interface TransportLogistics {
  driver_name: string;
  employee_id: string;
  national_id: string;
  role: string;
  assigned_route: string;
  transport_unit: string;
}

export interface DeliveryStatus {
  status: string;
  arrival_time: string;
  completion_time: string;
  observations: string;
}

export interface Authorizations {
  dispatched_by: string;
  received_by: string;
  authorized_by: string;
}

export interface DinatInvoiceDocument {
  document_metadata: DocumentMetadata;
  vendor: Vendor;
  client: Client;
  items: LineItem[];
  summary_by_presentation: SummaryByPresentation[];
  financial_totals: FinancialTotals;
  transport_logistics: TransportLogistics;
  delivery_status: DeliveryStatus;
  authorizations: Authorizations;
}

export type DocumentStatus = 'uploaded' | 'extracting' | 'reviewing' | 'ready_for_production' | 'exported';

export interface DocumentItemState {
  id: string;
  filename: string;
  fileSize: string;
  pageCount: number;
  status: DocumentStatus;
  extractedData?: DinatInvoiceDocument;
  pdfUrl?: string;
  pdfFile?: File;
}
