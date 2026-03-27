import React, { useState } from 'react';
import { FinancialState, UserRole, TransactionType } from '../types';
import { INSTITUTION_NAME, SCHOOL_NAME } from '../constants';

interface ReportsPageProps {
  state: FinancialState;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ state }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateBrandedCSV = (title: string, headers: string[], rows: string[][]) => {
    const preamble = [
      `"${INSTITUTION_NAME}"`,
      `"${SCHOOL_NAME}"`,
      `"REPORT TITLE: ${title}"`,
      `"GENERATED DATE: ${new Date().toLocaleString()}"`,
      "", // Spacer
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    return preamble;
  };

  const exportTransactions = () => {
    setIsExporting('transactions');
    const filtered = state.currentUser?.societyId 
      ? state.transactions.filter(t => t.societyId === state.currentUser?.societyId)
      : state.transactions;

    const headers = ['Date', 'Society', 'Description', 'Category', 'Type', 'Amount', 'Approved By'];
    const rows = filtered.map(t => {
      const soc = state.societies.find(s => s.id === t.societyId);
      return [
        new Date(t.date).toLocaleDateString(),
        soc?.name || t.societyId,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.type,
        t.amount.toString(),
        t.approvedBy || ''
      ];
    });

    const csv = generateBrandedCSV("Financial Ledger", headers, rows);
    setTimeout(() => {
      downloadCSV(`ieee_transactions_${new Date().toISOString().split('T')[0]}.csv`, csv);
      setIsExporting(null);
    }, 800);
  };

  const exportSocietySummary = () => {
    setIsExporting('societies');
    const headers = ['Society Name', 'Short Name', 'Initial Balance', 'Current Balance', 'Utilization %'];
    const rows = state.societies.map(s => {
      const util = s.budget > 0 ? Math.round(((s.budget - s.balance) / s.budget) * 100) : 0;
      return [
        `"${s.name}"`,
        s.shortName,
        s.budget.toString(),
        s.balance.toString(),
        `${util}%`
      ];
    });

    const csv = generateBrandedCSV("Budget Utilization Summary", headers, rows);
    setTimeout(() => {
      downloadCSV(`ieee_society_summary_${new Date().toISOString().split('T')[0]}.csv`, csv);
      setIsExporting(null);
    }, 800);
  };

  const exportEventReports = () => {
    setIsExporting('events');
    const filtered = state.currentUser?.societyId 
      ? state.events.filter(e => e.societyId === state.currentUser?.societyId)
      : state.events;

    const headers = ['Date', 'Society', 'Event Title', 'Type', 'Participants', 'Description', 'Outcomes'];
    const rows = filtered.map(e => {
      const soc = state.societies.find(s => s.id === e.societyId);
      return [
        new Date(e.date).toLocaleDateString(),
        soc?.shortName || e.societyId,
        `"${e.title.replace(/"/g, '""')}"`,
        e.type,
        e.participants.toString(),
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.outcome.replace(/"/g, '""')}"`
      ];
    });

    const csv = generateBrandedCSV("Event Activity Log", headers, rows);
    setTimeout(() => {
      downloadCSV(`ieee_event_activity_log_${new Date().toISOString().split('T')[0]}.csv`, csv);
      setIsExporting(null);
    }, 800);
  };

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const currentSoc = state.currentUser?.societyId ? state.societies.find(s => s.id === state.currentUser?.societyId) : null;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Audit & Reports</h2>
        <p className="text-slate-500 text-sm">Download official documentation for university submission and internal audits.</p>
      </div>

      {/* Branded Print Section (Centered for Professional Reports) */}
      <div className="hidden print:flex flex-col items-center text-center mb-10 pb-6 border-b-4 border-slate-900">
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{INSTITUTION_NAME}</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-3">{SCHOOL_NAME}</h2>
        <div className="w-24 h-1 bg-blue-600 mb-4 rounded-full"></div>
        <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-2">IEEE Student Branch Finance - Quarterly Statement</h3>
        
        {/* Organized By line in print preview - Updated as requested */}
        <div className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">
          ORGANIZED BY: {currentSoc ? `${currentSoc.name} (${currentSoc.shortName})` : 'IEEE STUDENT BRANCH (CENTRAL)'}
        </div>

        <p className="text-[10px] text-slate-400 font-bold">DOCUMENT GENERATED: {new Date().toLocaleString().toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Transactions Report */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-receipt text-xl"></i>
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Financial Ledger</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">
            Detailed list of all income and expenses, categorized and time-stamped for the current session.
          </p>
          <button 
            disabled={isExporting !== null}
            onClick={exportTransactions}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center disabled:bg-slate-200"
          >
            {isExporting === 'transactions' ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-download mr-2"></i> Export CSV</>}
          </button>
        </div>

        {/* Society Performance (Admin Only) */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <i className="fa-solid fa-chart-line text-xl"></i>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Budget Utilization</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">
              Cross-society comparison of budget vs balance, highlighting financial health and allocation efficiency.
            </p>
            <button 
              disabled={isExporting !== null}
              onClick={exportSocietySummary}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center disabled:bg-slate-200"
            >
              {isExporting === 'societies' ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-download mr-2"></i> Export Summary</>}
            </button>
          </div>
        )}

        {/* Event Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-calendar-check text-xl"></i>
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Activity Archive</h3>
          <p className="text-sm text-slate-500 mb-6 flex-1">
            Comprehensive log of conducted events, participant metrics, and impact statements for annual reporting.
          </p>
          <button 
            disabled={isExporting !== null}
            onClick={exportEventReports}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center disabled:bg-slate-200"
          >
            {isExporting === 'events' ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-download mr-2"></i> Download Log</>}
          </button>
        </div>
      </div>

      {/* Print Statement Preview */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Quarterly Board Statement</h3>
        <p className="text-slate-500 max-w-lg mx-auto mb-6">
          Generate a formal, print-ready document containing the Student Branch's high-level financial standing and AI-audited insights.
        </p>
        <button 
          onClick={() => window.print()}
          className="bg-white border-2 border-slate-900 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all shadow-md active:scale-95 flex items-center mx-auto"
        >
          <i className="fa-solid fa-print mr-2"></i>
          Print Preview Statement
        </button>
      </div>

      <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-100">
        <div className="mb-6 md:mb-0">
          <h4 className="text-xl font-bold mb-2">Need a custom reporting format?</h4>
          <p className="text-blue-100 text-sm max-w-md">Our AI Auditor can assist in structuring your financial data for specialized grant applications or IEEE region audits.</p>
        </div>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-colors">
          Consult AI Auditor
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;