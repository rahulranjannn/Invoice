import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { InvoiceRecord, ExpenseRecord, ChartDataPoint, ClientStats, VendorStats, Totals } from '../types';
import { calculateGstFromTotal, formatCurrency } from '../utils/formatting';
import { colors } from '../styles/design-tokens';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { ArrowUpRight, ArrowDownLeft, IndianRupee, ChevronDown, ChevronRight, RefreshCw, Download, AlertTriangle, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { cn } from './ui/Button';
import { TableSkeleton, EmptyState } from './ui/States';

export const GstAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [expandedClient, setExpandedClient] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data: invData, error: invError } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(100);
            if (invError) throw invError;
            setInvoices(invData || []);

            let expData: ExpenseRecord[] = [];
            try {
                const { data, error } = await supabase.from('expenses').select('*').limit(100);
                if (!error && data) expData = data;
            } catch (e) {
                console.warn("Expenses table check failed", e);
            }
            setExpenses(expData);
            setLastUpdated(new Date());

        } catch (err: any) {
            console.error('Error fetching analytics:', err);
            setError(err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getInvoiceGst = useCallback((inv: InvoiceRecord): number => {
        const storedGst = Number(inv.gst_total);
        if (!isNaN(storedGst) && storedGst > 0) return storedGst;
        return calculateGstFromTotal(Number(inv.amount) || 0);
    }, []);

    const analytics = useMemo(() => {
        const totalOutput = invoices.reduce((sum, inv) => sum + getInvoiceGst(inv), 0);
        const totalInput = expenses.reduce((sum, exp) => sum + (Number(exp.gst_amount) || 0), 0);

        const totals: Totals = {
            output: totalOutput,
            input: totalInput,
            net: totalOutput - totalInput
        };

        const monthMap = new Map<string, ChartDataPoint>();

        invoices.forEach(inv => {
            const d = inv.invoice_date || new Date().toISOString();
            const month = d.substring(0, 7);
            const curr = monthMap.get(month) || { name: month, Liability: 0, Credit: 0 };
            curr.Liability += getInvoiceGst(inv);
            monthMap.set(month, curr);
        });

        expenses.forEach(exp => {
            const d = exp.date || new Date().toISOString();
            const month = d.substring(0, 7);
            const curr = monthMap.get(month) || { name: month, Liability: 0, Credit: 0 };
            curr.Credit += Number(exp.gst_amount) || 0;
            monthMap.set(month, curr);
        });

        const chartData = Array.from(monthMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        const clientMap = new Map<string, ClientStats>();
        invoices.forEach(inv => {
            const key = `${inv.client_name}-${inv.gstin || 'N/A'}`;
            const curr = clientMap.get(key) || { name: inv.client_name, gstin: inv.gstin || 'N/A', totalSales: 0, totalGst: 0, invoices: [] };
            const gst = getInvoiceGst(inv);
            curr.totalSales += Number(inv.amount) || 0;
            curr.totalGst += gst;
            curr.invoices.push(inv);
            clientMap.set(key, curr);
        });
        const buyerStats = Array.from(clientMap.values()).sort((a, b) => b.totalGst - a.totalGst);

        const vendorMap = new Map<string, VendorStats>();
        expenses.forEach(exp => {
            const key = `${exp.vendor_name}-${exp.gstin || 'N/A'}`;
            const curr = vendorMap.get(key) || { name: exp.vendor_name, gstin: exp.gstin || 'N/A', totalSpent: 0, totalInputCredit: 0 };
            curr.totalSpent += Number(exp.total_amount) || 0;
            curr.totalInputCredit += Number(exp.gst_amount) || 0;
            vendorMap.set(key, curr);
        });
        const vendorStats = Array.from(vendorMap.values()).sort((a, b) => b.totalInputCredit - a.totalInputCredit);

        return { totals, chartData, buyerStats, vendorStats };

    }, [invoices, expenses, getInvoiceGst]);

    const getPieData = (data: any[], valueKey: string, palette: string[]) => {
        const top4 = data.slice(0, 4);
        const others = data.slice(4).reduce((sum, item) => sum + (item[valueKey] || 0), 0);
        const res = top4.map((item, idx) => ({
            name: item.gstin && item.gstin !== 'N/A' ? `${item.name} (${item.gstin})` : item.name,
            value: item[valueKey],
            color: palette[idx % palette.length]
        }));
        if (others > 0) res.push({ name: 'Others', value: others, color: palette[4] });
        if (res.length === 0) return [{ name: 'No Data', value: 1, color: colors.surface.border }];
        return res;
    };

    const clientPieData = useMemo(() => getPieData(analytics.buyerStats, 'totalGst', colors.charts.liability), [analytics.buyerStats]);
    const vendorPieData = useMemo(() => getPieData(analytics.vendorStats, 'totalInputCredit', colors.charts.credit), [analytics.vendorStats]);

    const toggleClient = (key: string) => setExpandedClient(prev => prev === key ? null : key);

    const handleDownloadCSV = () => {
        const headers = ["Month", "Liability (Output)", "Credit (Input)"];
        const rows = analytics.chartData.map(r => [r.name, r.Liability.toFixed(2), r.Credit.toFixed(2)]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "gst_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (error) {
        return (
            <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400">
                <AlertTriangle className="w-8 h-8" />
                <div>
                    <h3 className="font-bold">Failed to load analytics</h3>
                    <p className="text-sm opacity-80">{error}</p>
                    <Button variant="danger" size="sm" onClick={fetchData} className="mt-2">Retry</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-40 bg-slate-800 rounded-xl" />
                    <div className="h-40 bg-slate-800 rounded-xl" />
                    <div className="h-40 bg-slate-800 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-96 lg:col-span-2 bg-slate-800 rounded-xl" />
                    <div className="h-96 bg-slate-800 rounded-xl" />
                </div>
                <TableSkeleton rows={4} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">GST Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time overview. Last updated: {lastUpdated.toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchData} icon={<RefreshCw className="w-4 h-4" />} />
                    <Button variant="secondary" onClick={handleDownloadCSV} icon={<Download className="w-4 h-4" />}>Export CSV</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Total Output Liability"
                    amount={analytics.totals.output}
                    desc="GST Collected on Sales"
                    icon={<ArrowUpRight className="w-32 h-32" />}
                    amountClass="text-orange-400"
                    iconClass="text-orange-500"
                    hoverInfo
                />
                <SummaryCard
                    title="Total Input Credit"
                    amount={analytics.totals.input}
                    desc="GST Paid on Purchases (ITC)"
                    icon={<ArrowDownLeft className="w-32 h-32" />}
                    amountClass="text-emerald-400"
                    iconClass="text-emerald-500"
                    hoverInfo
                />
                <SummaryCard
                    title="Net Payable"
                    amount={Math.max(0, analytics.totals.net)}
                    desc={analytics.totals.net < 0 ? 'Excess Credit Carried Forward' : 'Expected Cash Ledger Payment'}
                    icon={<IndianRupee className="w-32 h-32" />}
                    amountClass="text-cyan-400"
                    iconClass="text-cyan-500 hover:text-cyan-400"
                    hoverInfo
                />
            </div>

            {/* Charts Grid */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Main Trend Area Chart */}
                <Card className="lg:w-2/3 p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-6">Liability vs Input Credit (Monthly)</h3>
                    <div className="flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorLiability" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.charts.liability[0]} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.charts.liability[0]} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.charts.credit[1]} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.charts.credit[1]} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.border} opacity={0.3} vertical={false} />
                                <XAxis dataKey="name" axisLine={{ stroke: colors.surface.borderLight }} tickLine={false} tick={{ fill: colors.text.muted, fontSize: 12 }} dy={10} />
                                <YAxis axisLine={{ stroke: colors.surface.borderLight }} tickLine={false} tick={{ fill: colors.text.muted, fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: colors.surface.card, borderRadius: '12px', border: `1px solid ${colors.surface.border}`, color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                                    itemStyle={{ color: '#f1f5f9', fontSize: '14px' }}
                                    labelStyle={{ color: colors.text.secondary, fontWeight: 600, marginBottom: '8px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Area type="monotone" dataKey="Liability" stroke={colors.charts.liability[0]} fillOpacity={1} fill="url(#colorLiability)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="Credit" stroke={colors.charts.credit[1]} fillOpacity={1} fill="url(#colorCredit)" strokeWidth={2} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pie Charts Column */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                    <PieWidget
                        title="Output Liability Distribution"
                        sub="Top clients by GST payable"
                        data={clientPieData}
                        total={analytics.totals.output}
                        totalLabel="Total Output"
                        amountClass="text-orange-400"
                    />
                    <PieWidget
                        title="Vendor Distribution"
                        sub="Top vendors by input credit"
                        data={vendorPieData}
                        total={analytics.totals.input}
                        totalLabel="Total Credit"
                        amountClass="text-blue-400"
                    />
                </div>
            </div>

            {/* Tables */}
            <div className="grid gap-8">
                <TableContainer title="Vendor-wise Input Credit Analysis" empty={analytics.vendorStats.length === 0}>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">Vendor Name</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider">GSTIN</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider text-right">Total Spent</th>
                                <th className="px-6 py-4 font-bold text-slate-400 uppercase text-xs tracking-wider text-right">Total Input Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {analytics.vendorStats.map((vendor, idx) => (
                                <tr key={idx} className="group hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{vendor.name}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{vendor.gstin}</td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-300 tabular-nums">{formatCurrency(vendor.totalSpent)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-400 tabular-nums">{formatCurrency(vendor.totalInputCredit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableContainer>

                <TableContainer title="Buyer-wise GST Distribution" empty={analytics.buyerStats.length === 0}>
                    <div className="divide-y divide-slate-700">
                        <div className="bg-slate-900 px-6 py-3 grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-1"></div>
                            <div className="col-span-5">Client Name</div>
                            <div className="col-span-3 text-right">Total Sales</div>
                            <div className="col-span-3 text-right">Total GST Collected</div>
                        </div>
                        {analytics.buyerStats.map((client) => {
                            const key = `${client.name}-${client.gstin}`;
                            const isExpanded = expandedClient === key;
                            return (
                                <div key={key} className="bg-slate-800 border-b border-slate-700/30 last:border-0">
                                    <div
                                        className="px-6 py-4 grid grid-cols-12 items-center cursor-pointer hover:bg-slate-700/50 transition-colors group"
                                        onClick={() => toggleClient(key)}
                                    >
                                        <div className="col-span-1 text-slate-500 group-hover:text-blue-400 transition-colors">
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </div>
                                        <div className="col-span-5">
                                            <div className="font-medium text-white">{client.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{client.gstin}</div>
                                        </div>
                                        <div className="col-span-3 text-right font-medium text-slate-300 tabular-nums">{formatCurrency(client.totalSales)}</div>
                                        <div className="col-span-3 text-right font-bold text-orange-400 tabular-nums">{formatCurrency(client.totalGst)}</div>
                                    </div>

                                    {isExpanded && (
                                        <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700/50 shadow-inner animate-in slide-in-from-top-2">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-slate-500 text-xs text-left">
                                                        <th className="pb-2 pl-2">Date</th>
                                                        <th className="pb-2">Invoice #</th>
                                                        <th className="pb-2 text-right">Amount</th>
                                                        <th className="pb-2 text-right pr-2">GST</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700/30">
                                                    {client.invoices.map((inv: InvoiceRecord) => (
                                                        <tr key={inv.id} className="hover:bg-slate-800/50">
                                                            <td className="py-2 pl-2 text-slate-400">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                                                            <td className="py-2 font-medium text-slate-300">{inv.invoice_number}</td>
                                                            <td className="py-2 text-right text-slate-400 tabular-nums">{formatCurrency(inv.amount)}</td>
                                                            <td className="py-2 text-right text-orange-400 font-medium tabular-nums pr-2">{formatCurrency(getInvoiceGst(inv))}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </TableContainer>
            </div>
        </div>
    );
};

// --- Sub Components ---

const SummaryCard = ({ title, amount, desc, icon, amountClass, iconClass, hoverInfo }: any) => (
    <div className={cn(
        "bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl shadow-xl border border-slate-700/50 p-6 relative overflow-hidden group transition-all duration-300",
        hoverInfo && "hover:border-blue-500/50 hover:shadow-2xl hover:scale-[1.01]"
    )}>
        <div className={cn("absolute top-0 right-0 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 rotate-12", iconClass)}>
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
            <p className={cn("text-4xl font-bold mb-1 tabular-nums tracking-tight", amountClass)}>{formatCurrency(amount)}</p>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    </div>
);

const PieWidget = ({ title, sub, data, total, totalLabel, amountClass }: any) => (
    <Card className="flex flex-col relative flex-1">
        <div className="p-6">
            <h3 className="font-bold text-white mb-1">{title}</h3>
            <p className="text-xs text-slate-400 mb-6">{sub}</p>

            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: colors.surface.card, border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{totalLabel}</p>
                    <p className={cn("text-sm font-bold tabular-nums", amountClass)}>{formatCurrency(total)}</p>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                {data.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm group hover:bg-slate-700/30 px-2.5 py-1.5 rounded-lg transition-colors">
                        <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-slate-800" style={{ backgroundColor: entry.color, '--tw-ring-color': `${entry.color}40` } as any}></div>
                            <span className="text-slate-300 font-medium text-xs sm:text-sm truncate max-w-[120px]">{entry.name}</span>
                        </div>
                        <span className="font-bold text-white text-xs sm:text-sm tabular-nums">{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

const TableContainer = ({ title, empty, children }: any) => (
    <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="font-bold text-white tracking-wide">{title}</h3>
        </div>
        <div>
            {empty ? (
                <EmptyState icon={<FileText />} title="No data found" description="No records available for this section yet." />
            ) : (
                <div className="overflow-x-auto">
                    {children}
                </div>
            )}
        </div>
    </Card>
);
