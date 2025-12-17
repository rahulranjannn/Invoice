import React from 'react';
import { X, CheckCircle, Building2, Download } from 'lucide-react';
import { SupplierDetails, InvoicePayload } from '../types';

// --- Company Settings Modal ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierDetails;
  onSave: (details: SupplierDetails) => void;
}

export const CompanySettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, supplier, onSave }) => {
  const [formData, setFormData] = React.useState<SupplierDetails>(supplier);

  React.useEffect(() => {
    if (isOpen) setFormData(supplier);
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Company Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Company Name</label>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={formData.legal_name}
              onChange={e => setFormData({...formData, legal_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your GSTIN</label>
            <input
              type="text"
              maxLength={15}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-mono uppercase"
              value={formData.gstin}
              onChange={e => setFormData({...formData, gstin: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => { onSave(formData); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Invoice Preview Modal ---
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: InvoicePayload | null;
  isSubmitting: boolean;
}

export const InvoicePreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, onConfirm, data, isSubmitting }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Invoice Preview</h3>
            <p className="text-sm text-gray-500">Please review details before generating.</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Paper View */}
        <div className="p-8 overflow-y-auto bg-gray-100 flex-1">
          <div className="bg-white shadow-sm border border-gray-200 p-8 min-h-[600px] text-sm text-gray-800">
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
              <div className="w-1/2">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">{data.supplier_details.legal_name}</h2>
                <p className="text-gray-600 whitespace-pre-line">{data.supplier_details.address}</p>
                <p className="mt-2 text-gray-600"><strong>GSTIN:</strong> {data.supplier_details.gstin}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-light text-gray-300 uppercase tracking-widest mb-2">Invoice</div>
                <div className="space-y-1">
                   <p><span className="font-semibold">Date:</span> {data.invoice_details.invoice_date}</p>
                   {data.invoice_details.order_ref_no && (
                      <p><span className="font-semibold">PO Ref:</span> {data.invoice_details.order_ref_no}</p>
                   )}
                   <p><span className="font-semibold">PO Date:</span> {data.invoice_details.order_date}</p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-100">
                <p className="font-bold text-lg">{data.buyer_details.name}</p>
                <p className="whitespace-pre-line text-gray-600">{data.buyer_details.address}</p>
                <div className="mt-3 flex gap-6">
                  <p><strong>GSTIN:</strong> {data.buyer_details.gstin}</p>
                  {data.buyer_details.vendor_code && (
                    <p><strong>Vendor Code:</strong> {data.buyer_details.vendor_code}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                  <th className="px-4 py-2 text-left rounded-l">#</th>
                  <th className="px-4 py-2 text-left w-1/3">Description</th>
                  <th className="px-4 py-2 text-left">HSN</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right rounded-r">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.line_items.map((item) => (
                  <tr key={item.serial_no}>
                    <td className="px-4 py-3 text-gray-500">{item.serial_no}</td>
                    <td className="px-4 py-3 font-medium">{item.description}</td>
                    <td className="px-4 py-3 text-gray-500">{item.hsn_code}</td>
                    <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right">₹{item.rate_per_unit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financials */}
            <div className="flex justify-end">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Taxable Amount</span>
                  <span className="font-medium">₹{data.financials.taxable_total.toFixed(2)}</span>
                </div>
                {data.financials.cgst_amount > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-100 text-sm">
                    <span className="text-gray-600">CGST (9%)</span>
                    <span>₹{data.financials.cgst_amount.toFixed(2)}</span>
                  </div>
                )}
                {data.financials.sgst_amount > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-100 text-sm">
                    <span className="text-gray-600">SGST (9%)</span>
                    <span>₹{data.financials.sgst_amount.toFixed(2)}</span>
                  </div>
                )}
                {data.financials.igst_amount > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-100 text-sm">
                    <span className="text-gray-600">IGST (18%)</span>
                    <span>₹{data.financials.igst_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-gray-800 text-lg font-bold">
                  <span>Grand Total</span>
                  <span>₹{data.financials.grand_total.toFixed(2)}</span>
                </div>
                <div className="pt-2 text-right text-xs text-gray-500 italic">
                  ({data.financials.amount_in_words})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-lg">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Back to Edit
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {isSubmitting ? (
                 <>Generating...</>
             ) : (
                 <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Generate
                 </>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};