import { InvoicePayload } from '../types';

// Relaxed validation to prevent loops
export const GSTIN_REGEX = /^[0-9A-Z]{15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidGstin = (gstin: string): boolean => {
    console.log(`Validating GSTIN: "${gstin}" against regex: ${GSTIN_REGEX}`);
    return GSTIN_REGEX.test(gstin);
};

export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

export const validateInvoicePayload = (payload: InvoicePayload): string | null => {
    // 1. Supplier Details
    if (!payload.supplier_details.legal_name) return "Supplier Legal Name is required.";
    if (!payload.supplier_details.gstin) return "Supplier GSTIN is required.";
    if (!isValidGstin(payload.supplier_details.gstin)) return "Invalid Supplier GSTIN format.";

    // 2. Buyer Details
    if (!payload.buyer_details.name) return "Buyer Name is required.";
    // GSTIN optional for unregistered buyers, check logic? Assuming B2B mostly, but allow empty if B2C logic exists. 
    // However, for this validate, let's enforce if provided.
    if (payload.buyer_details.gstin && !isValidGstin(payload.buyer_details.gstin)) {
        return "Invalid Buyer GSTIN format.";
    }

    // 3. Invoice Details
    if (!payload.invoice_details.invoice_date) return "Invoice Date is required.";
    if (isNaN(Date.parse(payload.invoice_details.invoice_date))) return "Invalid Invoice Date.";

    // 4. Line Items
    if (!payload.line_items || payload.line_items.length === 0) return "At least one line item is required.";
    for (const item of payload.line_items) {
        if (!item.description) return "Line item description is required.";
        if (item.quantity <= 0) return "Quantity must be greater than zero.";
        if (item.rate_per_unit < 0) return "Rate cannot be negative.";
    }

    // 5. Financials
    if (payload.financials.grand_total < 0) return "Grand Total cannot be negative.";

    return null; // No error
};
