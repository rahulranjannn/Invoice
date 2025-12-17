import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, User, Calendar, FileText } from 'lucide-react';
import { LineItem, BuyerDetails, InvoiceMeta, InvoicePayload, SupplierDetails } from '../types';
import { submitInvoice } from '../services/apiService';
import { CompanySettingsModal, InvoicePreviewModal } from './InvoiceModals';
import { calculateTaxes, numberToIndianWords } from '../utils/invoiceUtils';

const DEFAULT_SUPPLIER: SupplierDetails = {
  legal_name: "Dikshit Shreya Construction Pvt Ltd",
  gstin: "20AAECD9345G1ZV",
  address: "0, Near Markham College, Jai Prabha Nagar, Hazaribag, Jharkhand"
};

export const InvoiceForm: React.FC = () => {
  // --- State Management ---
  
  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Data State
  const [supplier, setSupplier] = useState<SupplierDetails>(DEFAULT_SUPPLIER);
  
  const [buyer, setBuyer] = useState<BuyerDetails>({
    name: '',
    gstin: '',
    address: '',
    vendor_code: ''
  });

  const [meta, setMeta] = useState<InvoiceMeta>({
    order_ref_no: '',
    order_date: new Date().toISOString().split('T')[0],
    invoice_date: new Date().toISOString().split('T')[0],
    gst_type: 'intra'
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate_per_unit: 0 }
  ]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewPayload, setPreviewPayload] = useState<InvoicePayload | null>(null);

  // --- Handlers ---

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate_per_unit: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleGstTypeChange = (type: 'intra' | 'inter') => {
    setMeta(prev => ({ ...prev, gst_type: type }));
  };

  // --- Validation & Preview Logic ---

  const validateForm = (): boolean => {
    setError(null);

    // 1. Supplier Validation (Implicitly safe due to defaults, but good to check)
    if (!supplier.legal_name || !supplier.gstin) {
      setError("Company details are incomplete. Please check Settings.");
      return false;
    }

    // 2. Buyer Validation
    if (!buyer.name.trim()) {
      setError("Buyer Name is required.");
      return false;
    }
    if (buyer.gstin.length !== 15) {
      setError("Buyer GSTIN must be exactly 15 characters.");
      return false;
    }
    if (!buyer.address.trim()) {
      setError("Buyer Address is required.");
      return false;
    }

    // 3. Invoice Meta Validation
    if (!meta.invoice_date) {
      setError("Invoice Date is strictly required.");
      return false;
    }
    // PO Reference is now Optional

    // 4. Line Items Validation (Strict)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description.trim()) {
        setError(`Row ${i + 1}: Description is required.`);
        return false;
      }
      if (!item.hsn_code.trim()) {
        setError(`Row ${i + 1}: HSN Code is required.`);
        return false;
      }
      if (item.quantity <= 0) {
        setError(`Row ${i + 1}: Quantity must be greater than 0.`);
        return false;
      }
      if (item.rate_per_unit < 0) { // Rate can be 0 (free sample), but usually >0
        setError(`Row ${i + 1}: Rate cannot be negative.`);
        return false;
      }
      if (!item.unit) {
        setError(`Row ${i + 1}: Unit is required.`);
        return false;
      }
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateForm()) return;

    // Calculate Financials
    const taxableTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate_per_unit), 0);
    const taxes = calculateTaxes(taxableTotal, meta.gst_type);
    
    // Construct Payload for Preview
    const payload: InvoicePayload = {
      meta: {
        action: "create_invoice",
        timestamp: new Date().toISOString()
      },
      supplier_details: supplier,
      buyer_details: {
        name: buyer.name,
        gstin: buyer.gstin,
        address: buyer.address,
        vendor_code: buyer.vendor_code || undefined // exclude if empty
      },
      invoice_details: {
        invoice_date: meta.invoice_date,
        order_ref_no: meta.order_ref_no || undefined,
        order_date: meta.order_date,
        gst_type: meta.gst_type === 'intra' ? 'intrastate' : 'interstate'
      },
      line_items: items.map((item, index) => ({
        serial_no: index + 1,
        description: item.description,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit: item.unit,
        rate_per_unit: item.rate_per_unit,
        amount: item.quantity * item.rate_per_unit
      })),
      financials: {
        taxable_total: taxableTotal,
        cgst_amount: taxes.cgst,
        sgst_amount: taxes.sgst,
        igst_amount: taxes.igst,
        grand_total: taxes.grandTotal,
        amount_in_words: numberToIndianWords(taxes.grandTotal)
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
      setSuccess("Invoice successfully created and sent for processing!");
      setShowPreview(false);
      // Optional: Reset form or redirect
    } catch (err) {
      // Keep preview open on error so they can retry
      setError("Failed to submit invoice. Please check your connection and try again.");
      setShowPreview(false); // Close preview to show error on main screen or show error in modal (simplified here)
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate live total for the bottom summary card (simple view)
  const currentTaxable = items.reduce((sum, item) => sum + (item.quantity * item.rate_per_unit), 0);
  const currentTaxEstimate = calculateTaxes(currentTaxable, meta.gst_type);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">New Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to generate a tax invoice.</p>
        </div>
        
        {/* User Profile / Company Settings Trigger */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
             <p className="text-sm font-medium text-gray-900">{supplier.legal_name}</p>
             <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Company Settings"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm animate-in fade-in slide-in-from-top-2">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm animate-in fade-in slide-in-from-top-2">
           <p className="font-medium">Success</p>
           <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Main Grid: Buyer & Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Buyer Details (Takes up 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Buyer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                <div className="flex gap-3">
                   <input 
                    type="text" 
                    name="name"
                    value={buyer.name}
                    onChange={e => setBuyer({...buyer, name: e.target.value})}
                    placeholder="Enter client company name"
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <div className="w-1/3">
                    <input 
                      type="text" 
                      name="vendor_code"
                      value={buyer.vendor_code}
                      onChange={e => setBuyer({...buyer, vendor_code: e.target.value})}
                      placeholder="Vendor Code (Opt)"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input 
                  type="text" 
                  name="gstin"
                  maxLength={15}
                  value={buyer.gstin}
                  onChange={e => setBuyer({...buyer, gstin: e.target.value})}
                  placeholder="15-digit GSTIN"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-mono uppercase"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                <textarea 
                  rows={2}
                  name="address"
                  value={buyer.address}
                  onChange={e => setBuyer({...buyer, address: e.target.value})}
                  placeholder="Full billing address"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Meta Data */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
               <FileText className="w-4 h-4 text-gray-400" /> Invoice Meta
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={meta.invoice_date}
                  onChange={e => setMeta({...meta, invoice_date: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Reference No.</label>
                <input 
                  type="text" 
                  value={meta.order_ref_no}
                  onChange={e => setMeta({...meta, order_ref_no: e.target.value})}
                  placeholder="Optional PO Number"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
                <input 
                  type="date" 
                  value={meta.order_date}
                  onChange={e => setMeta({...meta, order_date: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="pt-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">GST Category</label>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="gst_type" 
                        checked={meta.gst_type === 'intra'}
                        onChange={() => handleGstTypeChange('intra')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Intrastate (CGST+SGST)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="gst_type" 
                        checked={meta.gst_type === 'inter'}
                        onChange={() => handleGstTypeChange('inter')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Interstate (IGST)</span>
                    </label>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Items & Particulars</h2>
          <button 
            onClick={handleAddItem}
            className="inline-flex items-center px-4 py-2 border border-blue-200 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Row
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Description <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">HSN <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Qty <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Unit <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Rate <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Amount</th>
                <th className="px-4 py-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">{index + 1}</td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Item Description"
                      className="block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 bg-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={item.hsn_code}
                      onChange={(e) => handleItemChange(item.id, 'hsn_code', e.target.value)}
                      placeholder="HSN"
                      className="block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 bg-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      className="block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 text-right bg-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      className="block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 bg-transparent"
                    >
                      <option value="Pcs">Pcs</option>
                      <option value="Nos">Nos</option>
                      <option value="Kg">Kg</option>
                      <option value="Mtrs">Mtrs</option>
                      <option value="Sets">Sets</option>
                      <option value="Hrs">Hrs</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.rate_per_unit}
                      onChange={(e) => handleItemChange(item.id, 'rate_per_unit', Number(e.target.value))}
                      className="block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 text-right bg-transparent"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    {(item.quantity * item.rate_per_unit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Bar: Financials & Action */}
      <div className="flex flex-col md:flex-row justify-end items-start gap-8">
        <div className="w-full md:w-96 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxable Total</span>
            <span>₹{currentTaxEstimate.grandTotal ? currentTaxable.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
             <span>GST Amount (18%)</span>
             <span>₹{currentTaxEstimate.gstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
             <span>Grand Total</span>
             <span>₹{currentTaxEstimate.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          
          <div className="pt-4">
             <button 
               onClick={handlePreview}
               className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
             >
                <Eye className="w-4 h-4 mr-2" />
                Preview Invoice
             </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompanySettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        supplier={supplier}
        onSave={setSupplier}
      />

      <InvoicePreviewModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleFinalSubmit}
        data={previewPayload}
        isSubmitting={isLoading}
      />
    </div>
  );
};