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
}

// --- API Payload Schemas ---

export interface ApiLineItem {
  serial_no: number;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
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
  };
  line_items: ApiLineItem[];
  financials: Financials;
}