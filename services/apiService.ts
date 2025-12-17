import { InvoicePayload } from '../types';

const N8N_WEBHOOK_URL = 'https://rahulranjannn333.app.n8n.cloud/webhook/cc61665d-1b02-436b-8ca1-c558e811539e';

export const submitInvoice = async (payload: InvoicePayload): Promise<void> => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    // Some n8n webhooks might return 200 with text, so we don't strictly parse JSON unless expected
    return; 
  } catch (error) {
    console.error('Failed to submit invoice:', error);
    throw error;
  }
};