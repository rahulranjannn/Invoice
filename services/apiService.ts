import { InvoicePayload } from '../types';
import { validateInvoicePayload } from '../utils/validation';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://rahulranjannn333.app.n8n.cloud/webhook/cc61665d-1b02-436b-8ca1-c558e811539e';

export const submitInvoice = async (payload: InvoicePayload): Promise<void> => {
  // 1. Validation
  const validationError = validateInvoicePayload(payload);
  if (validationError) {
    throw new Error(`Validation Error: ${validationError}`);
  }

  // 2. Submit
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText} (${response.status})`);
    }

    return;
  } catch (error) {
    console.error('Failed to submit invoice:', error);
    throw error;
  }
};