import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Download, Receipt, Search, Filter, Eye, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { feeDetails, getFeeDetails, studentProfile } from "../../hooks/studentPortalData";
import { useDragToScroll } from "../../hooks/useDragToScroll";
import OfficialFeeReceiptModal from "./OfficialFeeReceiptModal";

export default function FeeReceiptsSection() {
  const [receiptsList, setReceiptsList] = useState(() => [...getFeeDetails().receipts]);
  const [selectedSession, setSelectedSession] = useState("All Sessions");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { ref: tableContainerRef, scrollLeftBy, scrollRightBy, events: dragEvents } = useDragToScroll();

  useEffect(() => {
    const handleUpdate = () => {
      setReceiptsList([...getFeeDetails().receipts]);
    };
    window.addEventListener("feeDataUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("feeDataUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter receipts by session
  const filteredReceipts = receiptsList.filter((item) => {
    if (selectedSession === "All Sessions") return true;
    return item.session === selectedSession;
  });
  const availableSessions = Array.from(new Set(receiptsList.map((item) => item.session).filter(Boolean)));

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const handlePrintReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Fee Receipts</h2>
            <p className="text-[11px] text-gray-500">
              Select session to view and print official student fee receipts
            </p>
          </div>
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            Session:
          </label>
          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="All Sessions">All Sessions</option>
            {availableSessions.map((session) => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div
          ref={tableContainerRef}
          {...dragEvents}
          className="overflow-x-auto select-none scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-slate-100 active:cursor-grabbing"
        >
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="bg-purple-900 text-white font-black">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Particulars</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-semibold">
                    No receipts found for the selected session.
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((receipt) => (
                  <tr key={receipt.receiptNo} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{receipt.receiptNo}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">{receipt.receiptDate}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{receipt.particulars}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-100">
                        {receipt.session}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-100">
                        {receipt.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      Rs. {receipt.totalRecAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handlePrintReceipt(receipt)}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredReceipts.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-gray-800">{Math.min(filteredReceipts.length, startIndex + itemsPerPage)}</strong> of{" "}
            <strong className="text-gray-800">{filteredReceipts.length}</strong> receipts
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg font-black text-xs cursor-pointer transition-all ${
                  currentPage === pageNum
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Formatted Fee Receipt Modal */}
      <OfficialFeeReceiptModal
        receipt={selectedReceipt}
        student={studentProfile}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}

