import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { InvoiceRecord, ExpenseRecord } from '../types';
import { FileText, Search, Filter, Receipt, ShoppingCart, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { TableSkeleton, EmptyState } from './ui/States';
import { formatCurrency, formatDate } from '../utils/formatting';

type ViewMode = 'sales' | 'purchases';

export const PastInvoices: React.FC = () => {
    const [view, setView] = useState<ViewMode>('sales');
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (view === 'sales') {
                const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
                setInvoices(data || []);
            } else {
                const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
                setExpenses(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [view]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (view === 'sales') {
            return invoices.filter(inv =>
                inv.client_name.toLowerCase().includes(lowerSearch) ||
                inv.invoice_number.toLowerCase().includes(lowerSearch)
            );
        } else {
            return expenses.filter(exp =>
                exp.vendor_name.toLowerCase().includes(lowerSearch) ||
                (exp.invoice_number && exp.invoice_number.toLowerCase().includes(lowerSearch))
            );
        }
    }, [invoices, expenses, view, searchTerm]);

    const getStatusVariant = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Transaction History</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Track and manage your {view === 'sales' ? 'outgoing invoices' : 'incoming expenses'}.
                    </p>
                </div>

                <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex shadow-sm">
                    <button
                        onClick={() => setView('sales')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'sales' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >
                        <Receipt className="w-4 h-4" /> Sales
                    </button>
                    <button
                        onClick={() => setView('purchases')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'purchases' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >
                        <ShoppingCart className="w-4 h-4" /> Purchases
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Input
                        placeholder={view === 'sales' ? "Search client or invoice #..." : "Search vendor or bill #..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        startIcon={<Search className="w-4 h-4" />}
                        className="w-full sm:max-w-md"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>Filter</Button>
                    <Button variant="secondary" onClick={fetchData} icon={<RefreshCw className="w-4 h-4" />} />
                </div>
            </div>

            {/* Content */}
            <Card className="min-h-[400px]">
                {loading ? (
                    <div className="p-8"><TableSkeleton rows={6} /></div>
                ) : filteredData.length === 0 ? (
                    <EmptyState
                        icon={view === 'sales' ? <FileText /> : <ShoppingCart />}
                        title={`No ${view} records found`}
                        description={searchTerm ? "Try adjusting your search terms." : "Create your first record to get started."}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Reference</th>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Party Details</th>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider text-right">Amount</th>
                                    {view === 'sales' && <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider text-center">Status</th>}
                                    {view === 'sales' && <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredData.map((item: any) => (
                                    <tr key={item.id} className="group hover:bg-slate-700/30 transition-colors duration-150">
                                        <td className="px-6 py-4 text-slate-300 font-medium whitespace-nowrap">
                                            {formatDate(view === 'sales' ? item.invoice_date : item.date)}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-300">
                                            {item.invoice_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-200 text-sm">{view === 'sales' ? item.client_name : item.vendor_name}</span>
                                                {item.gstin && <span className="text-xs text-slate-500 font-mono mt-0.5">GST: {item.gstin}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-white tracking-wide">
                                                {formatCurrency(view === 'sales' ? item.amount : item.total_amount)}
                                            </div>
                                            {view === 'purchases' && (
                                                <div className="text-xs text-emerald-500 font-medium mt-0.5">
                                                    ITC: {formatCurrency(Number(item.gst_amount))}
                                                </div>
                                            )}
                                        </td>
                                        {view === 'sales' && (
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={getStatusVariant(item.status)} label={item.status || 'Generated'} dot />
                                            </td>
                                        )}
                                        {view === 'sales' && (
                                            <td className="px-6 py-4 text-right">
                                                {item.pdf_link ? (
                                                    <a
                                                        href={item.pdf_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/10"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> PDF
                                                    </a>
                                                ) : <span className="text-slate-600 italic text-xs">Processing</span>}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
