import React, { useState } from 'react';
import { Plus, Trash2, Eye, Building2, FileText, Check, AlertCircle, PenLine } from 'lucide-react';
import { LineItem, BuyerDetails, InvoiceMeta, InvoicePayload, SupplierDetails } from '../types';
import { submitInvoice } from '../services/apiService';
import { isValidGstin } from '../utils/validation';
import { CompanySettingsModal, InvoicePreviewModal } from './InvoiceModals';
import { calculateTaxes, numberToIndianWords } from '../utils/formatting';
import { getSellerProfile, saveSellerProfile } from '../utils/storage';

// New UI Components
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';

export const InvoiceForm: React.FC = () => {
  // --- State Management ---
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [supplier, setSupplier] = useState<SupplierDetails>(getSellerProfile());
  const [buyer, setBuyer] = useState<BuyerDetails>({ name: '', gstin: '', address: '', vendor_code: '' });
  const [meta, setMeta] = useState<InvoiceMeta>({
    order_ref_no: '',
    order_date: new Date().toISOString().split('T')[0],
    invoice_date: new Date().toISOString().split('T')[0],
    gst_type: 'intra',
    gst_rate: 18
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate_per_unit: 0 }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewPayload, setPreviewPayload] = useState<InvoicePayload | null>(null);

  const handleSupplierUpdate = (newDetails: SupplierDetails) => {
    console.log("Updating supplier details:", newDetails);
    // Force new object reference to ensure re-render
    setSupplier({ ...newDetails });
    saveSellerProfile(newDetails);
    // Clear any previous errors to exit the validation loop
    setError(null);
  };

  // --- Handlers ---
  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate_per_unit: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const validateForm = (): boolean => {
    setError(null);
    if (!supplier.legal_name || !supplier.gstin) {
      setError("Company details are incomplete. Please update your profile.");
      setShowSettings(true);
      return false;
    }
    if (!isValidGstin(supplier.gstin)) {
      setError("Your Company GSTIN is invalid. Please update it in settings.");
      setShowSettings(true);
      return false;
    }
    if (!buyer.name.trim()) {
      setError("Buyer Name is required.");
      return false;
    }
    if (buyer.gstin && !isValidGstin(buyer.gstin)) {
      setError("Invalid Buyer GSTIN format. Format: 22AAAAA0000A1Z5");
      return false;
    }
    if (!meta.invoice_date) {
      setError("Invoice Date is required.");
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim()) {
        setError(`Row ${i + 1}: Description is required.`);
        return false;
      }
      if (items[i].quantity <= 0) {
        setError(`Row ${i + 1}: Quantity must be > 0.`);
        return false;
      }
    }
    return true;
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    const taxableTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate_per_unit), 0);
    const taxes = calculateTaxes(taxableTotal, meta.gst_type, meta.gst_rate);

    const payload: InvoicePayload = {
      meta: { action: "create_invoice", timestamp: new Date().toISOString() },
      supplier_details: supplier,
      buyer_details: { ...buyer, vendor_code: buyer.vendor_code || undefined },
      invoice_details: {
        invoice_date: meta.invoice_date,
        order_ref_no: meta.order_ref_no || undefined,
        order_date: meta.order_date,
        gst_type: meta.gst_type === 'intra' ? 'intrastate' : 'interstate',
        gst_rate: meta.gst_rate || 18
      },
      line_items: items.map((item, idx) => ({
        serial_no: idx + 1,
        description: item.description,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate_per_unit, // Explicitly mapping for potential PDF template compatibility
        rate_per_unit: item.rate_per_unit,
        amount: item.quantity * item.rate_per_unit
      })),
      financials: {
        taxable_total: taxableTotal,
        cgst_amount: taxes.cgst,
        sgst_amount: taxes.sgst,
        igst_amount: taxes.igst,
        grand_total: taxes.grandTotal,
        amount_in_words: numberToIndianWords(taxes.grandTotal),
        // Add explicit tax rates and flattened properties for simpler template access
        tax_breakup: {
          cgst_rate: meta.gst_type === 'intra' ? (meta.gst_rate || 18) / 2 : 0,
          sgst_rate: meta.gst_type === 'intra' ? (meta.gst_rate || 18) / 2 : 0,
          igst_rate: meta.gst_type === 'inter' ? (meta.gst_rate || 18) : 0
        },
        // Flattened for template compatibility
        cgst_rate: meta.gst_type === 'intra' ? (meta.gst_rate || 18) / 2 : 0,
        sgst_rate: meta.gst_type === 'intra' ? (meta.gst_rate || 18) / 2 : 0,
        igst_rate: meta.gst_type === 'inter' ? (meta.gst_rate || 18) : 0
      }
    };
    setPreviewPayload(payload);
    setShowPreview(true);
  };

  const handleFinalSubmit = async () => {
    if (!previewPayload) return;
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await submitInvoice(previewPayload);
      setSuccess("Invoice successfully generated!");
      setShowPreview(false);
      setShowPreview(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit invoice. Please try again.");
      setShowPreview(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Calculations
  const currentTaxable = items.reduce((sum, item) => sum + (item.quantity * item.rate_per_unit), 0);
  const currentTaxEstimate = calculateTaxes(currentTaxable, meta.gst_type, meta.gst_rate);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">New Invoice</h2>
          <p className="text-slate-400 text-sm mt-1">Create and manage professional tax invoices</p>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-2 pr-4 shadow-lg hover:border-slate-600 transition-all cursor-pointer group" onClick={() => setShowSettings(true)}>
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
            {supplier.legal_name.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Selling as</p>
            <p className="text-sm font-semibold text-slate-100 truncate max-w-[140px]">{supplier.legal_name}</p>
          </div>
          <PenLine className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors ml-2" />
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Buyer & Meta */}
        <div className="lg:col-span-2 space-y-8">

          {/* Buyer Details */}
          <Card hoverEffect>
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Buyer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Client Company Name"
                    required
                    placeholder="Enter company name"
                    value={buyer.name}
                    onChange={e => setBuyer({ ...buyer, name: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    label="GSTIN"
                    placeholder="15-digit GSTIN"
                    maxLength={15}
                    value={buyer.gstin}
                    onChange={e => setBuyer({ ...buyer, gstin: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    label="Vendor Code"
                    placeholder="Optional"
                    value={buyer.vendor_code}
                    onChange={e => setBuyer({ ...buyer, vendor_code: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billing Address</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-inner"
                    placeholder="Enter full billing address..."
                    value={buyer.address}
                    onChange={e => setBuyer({ ...buyer, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="overflow-visible">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Items & Particulars
              </CardTitle>
              <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleAddItem}>
                Add Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase w-12 text-center">#</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase min-w-[200px]">Description</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase w-24">HSN</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase w-20 text-right">Qty</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase w-24">Unit</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase w-32 text-right">Rate</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase w-32 text-right">Amount</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-500 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Item Description"
                          className="w-full bg-transparent border-none p-0 text-sm text-white placeholder:text-slate-600 focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.hsn_code}
                          onChange={(e) => handleItemChange(item.id, 'hsn_code', e.target.value)}
                          placeholder="HSN"
                          className="w-full bg-transparent border-none p-0 text-sm text-slate-300 placeholder:text-slate-600 focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="w-full bg-transparent border-none p-0 text-sm text-white text-right focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm text-slate-400 focus:ring-0 cursor-pointer"
                        >
                          {['Pcs', 'Nos', 'Kg', 'Mtrs', 'Sets', 'Hrs', 'Days'].map(u => (
                            <option key={u} className="bg-slate-800" value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={item.rate_per_unit}
                          onChange={(e) => handleItemChange(item.id, 'rate_per_unit', Number(e.target.value))}
                          className="w-full bg-transparent border-none p-0 text-sm text-white text-right focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-blue-400 tabular-nums">
                        {(item.quantity * item.rate_per_unit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-0 p-1 rounded-md hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Meta & Actions */}
        <div className="space-y-8">
          <Card hoverEffect>
            <CardHeader className="bg-slate-900/50">
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Input
                type="date"
                label="Invoice Date"
                required
                value={meta.invoice_date}
                onChange={e => setMeta({ ...meta, invoice_date: e.target.value })}
              />
              <Input
                label="PO Reference No."
                placeholder="e.g. PO-2024-001"
                value={meta.order_ref_no}
                onChange={e => setMeta({ ...meta, order_ref_no: e.target.value })}
              />
              <Input
                type="date"
                label="PO Date"
                value={meta.order_date}
                onChange={e => setMeta({ ...meta, order_date: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GST Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMeta({ ...meta, gst_type: 'intra' })}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${meta.gst_type === 'intra' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                  >
                    INTRASTATE
                  </button>
                  <button
                    onClick={() => setMeta({ ...meta, gst_type: 'inter' })}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${meta.gst_type === 'inter' ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                  >
                    INTERSTATE
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GST Rate</label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 12, 18].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setMeta({ ...meta, gst_rate: rate })}
                      className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${meta.gst_rate === rate
                        ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Taxable Amount</span>
                <span className="text-white font-medium tabular-nums">₹{currentTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">GST ({meta.gst_rate || 18}%)</span>
                <span className="text-white font-medium tabular-nums">₹{currentTaxEstimate.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-dashed border-slate-700 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">Grand Total</span>
                <span className="text-2xl font-bold text-blue-400 tabular-nums">₹{currentTaxEstimate.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                onClick={handlePreview}
                icon={<Eye className="w-5 h-5" />}
              >
                Preview Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CompanySettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} supplier={supplier} onSave={handleSupplierUpdate} />
      <InvoicePreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} onConfirm={handleFinalSubmit} data={previewPayload} isSubmitting={isLoading} />
    </div>
  );
};