import React, { useState } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { PastInvoices } from './components/PastInvoices';
import { GstAnalytics } from './components/GstAnalytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlusCircle, FileClock, BarChart3, Receipt } from 'lucide-react';
import { Button } from './components/ui/Button';

type Tab = 'new' | 'past' | 'gst';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('new');

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Header / Navigation */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Invoice<span className="text-blue-400">+</span></h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <NavButton
                active={activeTab === 'new'}
                onClick={() => setActiveTab('new')}
                icon={<PlusCircle className="w-4 h-4" />}
                label="New Invoice"
              />
              <NavButton
                active={activeTab === 'past'}
                onClick={() => setActiveTab('past')}
                icon={<FileClock className="w-4 h-4" />}
                label="History"
              />
              <NavButton
                active={activeTab === 'gst'}
                onClick={() => setActiveTab('gst')}
                icon={<BarChart3 className="w-4 h-4" />}
                label="Analytics"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'new' && <InvoiceForm />}
            {activeTab === 'past' && <PastInvoices />}
            {activeTab === 'gst' && <GstAnalytics />}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10'
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
