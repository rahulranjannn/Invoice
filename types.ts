export interface LineItem {
  id: string; // Internal ID for React keys
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
}

export interface SupplierDetails {
  legal_name: string;
  gstin: string;
  address: string;
  city?: string;
  state_code?: string;
  email?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  auth_signatory?: string;
}

export interface BuyerDetails {
  name: string;
  gstin: string;
  address: string;
  vendor_code: string; // Optional in UI, but part of schema
}

export interface InvoiceMeta {
  order_ref_no: string;
  order_date: string;
  invoice_date: string;
  gst_type: 'intra' | 'inter';
  gst_rate?: number; // Added to support variable GST rates (e.g., 18)
}

// --- API Payload Schemas ---

export interface ApiLineItem {
  serial_no: number;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate?: number; // Added to support potential PDF compatibility
  rate_per_unit: number;
  amount: number;
}

export interface Financials {
  taxable_total: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  grand_total: number;
  amount_in_words: string;
  tax_breakup?: {
    cgst_rate: number;
    sgst_rate: number;
    igst_rate: number;
  };
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
}

export interface InvoicePayload {
  meta: {
    action: string;
    timestamp: string;
  };
  supplier_details: SupplierDetails;
  buyer_details: {
    name: string;
    gstin: string;
    address: string;
    vendor_code?: string;
  };
  invoice_details: {
    invoice_date: string;
    order_ref_no?: string;
    order_date: string;
    gst_type: string;
    gst_rate?: number;
  };
  line_items: ApiLineItem[];
  financials: Financials;
}

// --- Supabase Database Schema ---

export interface InvoiceRecord {
  id: number;
  created_at: string;
  invoice_number: string;
  client_name: string;
  gstin?: string;    // Buyer GSTIN
  status?: string;   // 'Generated', 'Sent', 'Paid', etc.
  amount: number;    // Grand Total
  invoice_date: string;
  pdf_link: string;
  gst_total: number; // Total Tax Amount
}

export interface ExpenseRecord {
  id: number;
  created_at: string;
  date: string;
  invoice_number?: string;
  vendor_name: string;
  gstin?: string;
  taxable_amount: number;
  gst_amount: number; // Input Tax Credit
  total_amount: number;
  category?: string;
}

// --- Analytics & Charts ---

export interface ChartDataPoint {
  name: string;
  Liability: number;
  Credit: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface ClientStats {
  name: string;
  gstin: string;
  totalSales: number;
  totalGst: number;
  invoices: InvoiceRecord[];
}

export interface VendorStats {
  name: string;
  gstin: string;
  totalSpent: number;
  totalInputCredit: number;
}

export interface Totals {
  output: number;
  input: number;
  net: number;
}

export interface GstAnalyticsRecord {
  month_year: string;
  total_revenue: number;
  total_output_gst: number;
  total_invoices: number;
}
