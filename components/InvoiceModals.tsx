import React from 'react';
import { X, CheckCircle, Building2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = React.useState<'general' | 'bank'>('general');

  React.useEffect(() => {
    if (isOpen) setFormData(supplier);
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Seller Profile
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-blue-500 text-blue-400 bg-slate-700/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            General Details
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'bank' ? 'border-blue-500 text-blue-400 bg-slate-700/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Bank & Signatory
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'general' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. Acme Solutions Pvt Ltd"
                  value={formData.legal_name}
                  onChange={e => setFormData({ ...formData, legal_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">GSTIN</label>
                <input
                  type="text"
                  maxLength={15}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none uppercase placeholder:text-slate-600"
                  placeholder="29AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Registered Address</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none placeholder:text-slate-600"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  value={formData.city || ''}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">State Code</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  placeholder="e.g. 29"
                  value={formData.state_code || ''}
                  onChange={e => setFormData({ ...formData, state_code: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bank_name || ''}
                  onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Account Number</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  value={formData.account_number || ''}
                  onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">IFSC Code</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  value={formData.ifsc_code || ''}
                  onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })}
                />
              </div>
              <div className="col-span-2 mt-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Authorized Signatory Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none placeholder:text-slate-600"
                  placeholder="Name appearing on signature"
                  value={formData.auth_signatory || ''}
                  onChange={e => setFormData({ ...formData, auth_signatory: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onSave(formData); onClose(); }}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            Save & Update
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh] border border-slate-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-white">Invoice Preview</h3>
            <p className="text-sm text-slate-400">Review before final generation</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Paper View */}
        <div className="p-8 overflow-y-auto bg-slate-900 flex-1">
          <div className="bg-white shadow-xl mx-auto p-8 min-h-[600px] text-sm text-gray-800 max-w-3xl">
            {/* ... Kept white because it simulates paper ... */}

            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
              <div className="w-1/2">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{data.supplier_details.legal_name}</h2>
                <p className="text-gray-500 whitespace-pre-line text-xs">{data.supplier_details.address}</p>
                <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                  {data.supplier_details.city && <p>{data.supplier_details.city}, State Code: {data.supplier_details.state_code}</p>}
                  <p><strong>GSTIN:</strong> {data.supplier_details.gstin}</p>
                  {data.supplier_details.email && <p>Email: {data.supplier_details.email}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-light text-gray-200 uppercase tracking-widest mb-2">Invoice</div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold text-gray-700">Date:</span> {data.invoice_details.invoice_date}</p>
                  {data.invoice_details.order_ref_no && (
                    <p><span className="font-semibold text-gray-700">PO Ref:</span> {data.invoice_details.order_ref_no}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8 flex gap-8">
              <div className="w-1/2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-100">
                  <p className="font-bold text-gray-900">{data.buyer_details.name}</p>
                  <p className="whitespace-pre-line text-gray-600 text-xs mt-1">{data.buyer_details.address}</p>
                  <div className="mt-3 text-xs">
                    <p><span className="font-semibold">GSTIN:</span> {data.buyer_details.gstin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="bg-gray-900 text-white text-xs uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left w-1/3">Description</th>
                  <th className="px-4 py-2 text-left">HSN</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.line_items.map((item) => (
                  <tr key={item.serial_no}>
                    <td className="px-4 py-2 text-gray-400 text-xs">{item.serial_no}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{item.description}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{item.hsn_code}</td>
                    <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-2 text-right">₹{item.rate_per_unit.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-bold text-gray-900">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financials */}
            <div className="flex justify-end">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                  <span>Taxable Amount</span>
                  <span className="font-medium text-gray-900">₹{data.financials.taxable_total.toFixed(2)}</span>
                </div>
                {/* Simplified Tax Display for Preview */}
                <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                  <span>Total Tax</span>
                  <span>₹{(data.financials.grand_total - data.financials.taxable_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900 text-lg font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{data.financials.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Bank Details */}
            {data.supplier_details.bank_name && (
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-end">
                <div className="text-xs text-gray-500">
                  <p className="font-bold text-gray-700 uppercase mb-1">Bank Details</p>
                  <p>Bank: {data.supplier_details.bank_name}</p>
                  <p>A/c: {data.supplier_details.account_number}</p>
                  <p>IFSC: {data.supplier_details.ifsc_code}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{data.supplier_details.legal_name}</p>
                  <div className="h-8"></div>
                  <p className="text-xs text-gray-400">Authorized Signatory</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 flex justify-between items-center rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-medium transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</span>
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