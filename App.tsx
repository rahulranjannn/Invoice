import React from 'react';
import { InvoiceForm } from './components/InvoiceForm';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* 
        In a real dashboard, this would be wrapped in a Sidebar/Layout component.
        For this task, we focus on the "New Invoice" tab content.
      */}
      <InvoiceForm />
    </div>
  );
}