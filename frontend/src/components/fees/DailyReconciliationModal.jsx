import React from "react";
import { Printer, X, DollarSign, Wallet, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

/**
 * DailyReconciliationModal Component
 * Renders an official Daily Cash Desk Reconciliation & Audit Summary
 * for Fee Officers with 1-click A4 print support.
 */
export default function DailyReconciliationModal({ transactions = [], onClose }) {
  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  // Calculate reconciliation figures
  const totalCollections = transactions.reduce((acc, t) => acc + (parseFloat(t.cr) || 0), 0);
  const cashPayments = transactions.filter(t => (t.transaction_mode || t.mode || "").toLowerCase().includes("cash"));
  const onlinePayments = transactions.filter(t => !(t.transaction_mode || t.mode || "").toLowerCase().includes("cash"));

  const totalCashAmount = cashPayments.reduce((acc, t) => acc + (parseFloat(t.cr) || 0), 0);
  const totalOnlineAmount = onlinePayments.reduce((acc, t) => acc + (parseFloat(t.cr) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:w-full print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white print:text-black">
        
        {/* Header (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Daily Cash Counter Reconciliation Report</h3>
              <p className="text-xs text-slate-400">Audit & Cash Reconciliation Summary for Fee Desk</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Summary (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 overflow-y-auto font-sans text-slate-200 print:p-0 print:text-black print:overflow-visible bg-slate-900 print:bg-white">
          
          {/* Header Branding */}
          <div className="border-b-2 border-emerald-500 pb-4 mb-6 text-center print:border-black">
            <h1 className="text-xl font-black text-white print:text-black uppercase tracking-wider">
              SARVADNYA VIDYAPEETH - ACCOUNTS & FINANCIAL DESK
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-700">
              Daily Counter Collection & Reconciliation Audit Sheet | Date: <strong>{todayStr}</strong>
            </p>
          </div>

          {/* Key Metrics Cards Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8 font-sans">
            <div className="bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-400 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 print:text-gray-700 uppercase">Total Cash Collections</p>
              <p className="text-xl font-black text-emerald-400 print:text-black mt-1">Rs. {totalCashAmount.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600 mt-1">{cashPayments.length} Cash Receipts Issued</p>
            </div>

            <div className="bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-400 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 print:text-gray-700 uppercase">Online & Portal Collections</p>
              <p className="text-xl font-black text-cyan-400 print:text-black mt-1">Rs. {totalOnlineAmount.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600 mt-1">{onlinePayments.length} Online Transactions</p>
            </div>

            <div className="bg-slate-800/60 print:bg-gray-100 border border-slate-700 print:border-gray-400 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 print:text-gray-700 uppercase">Gross Total Realized</p>
              <p className="text-xl font-black text-white print:text-black mt-1">Rs. {totalCollections.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600 mt-1">{transactions.length} Total Receipts Today</p>
            </div>
          </div>

          {/* Detailed Transaction Breakdown Table */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase text-slate-300 print:text-black mb-3">
              Itemized Counter Transactions Log
            </h4>
            <div className="border border-slate-700 print:border-gray-400 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800 print:bg-gray-200 text-slate-300 print:text-black font-bold border-b border-slate-700 print:border-gray-400">
                  <tr>
                    <th className="px-3 py-2">Receipt / Txn ID</th>
                    <th className="px-3 py-2">Student Scholar No / Name</th>
                    <th className="px-3 py-2">Particulars / Head</th>
                    <th className="px-3 py-2">Payment Mode</th>
                    <th className="px-3 py-2 text-right">Amount (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-300 print:text-gray-900">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500 print:text-gray-600">
                        No financial transactions logged for today yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t, idx) => (
                      <tr key={t.id || idx} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                        <td className="px-3 py-2 font-semibold text-indigo-400 print:text-black">{t.receipt_no || t.id}</td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-white print:text-black">{t.student_name || t.studentName}</span>
                          <span className="block text-[10px] text-slate-400 print:text-gray-600">{t.scholar_no || t.scholarNo || t.roll_number || t.rollNumber}</span>
                        </td>
                        <td className="px-3 py-2">{t.particulars}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            (t.transaction_mode || "").toLowerCase().includes("cash")
                              ? "bg-emerald-500/10 text-emerald-400 print:bg-gray-200 print:text-black"
                              : "bg-cyan-500/10 text-cyan-400 print:bg-gray-200 print:text-black"
                          }`}>
                            {t.transaction_mode || t.mode || "Cash"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-400 print:text-black">
                          Rs. {parseFloat(t.cr || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cashier Clearance & Audit Block */}
          <div className="pt-8 border-t border-slate-800 print:border-gray-400 flex justify-between items-end">
            <div>
              <div className="flex items-center space-x-1 text-emerald-400 print:text-black text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4 print:hidden" />
                <span>Audited & Reconciled</span>
              </div>
              <p className="text-[10px] text-slate-500 print:text-gray-600">Sarvadnya ERP Financial Core v5.0</p>
            </div>

            <div className="text-right">
              <div className="h-8 border-b border-dashed border-slate-700 print:border-black w-48 mb-2"></div>
              <p className="text-xs font-bold text-white print:text-black">Cash Counter Officer Signature</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600">Accounts & Fee Audit Desk</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

