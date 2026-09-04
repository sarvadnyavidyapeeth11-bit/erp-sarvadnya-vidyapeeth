import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Eye,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  IndianRupee
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import {
  getStudentLedgerEntries,
  getActiveStudentProfile,
  studentProfile,
  getFeeDetails
} from "../../../hooks/studentPortalData";
import { useDragToScroll } from "../../../hooks/useDragToScroll";
import StudentOfficialLedgerPrintModal from "../../../components/fees/StudentOfficialLedgerPrintModal";
import Pagination from "../../../components/common/Pagination";

export default function FeeLedgerPage() {
  const activeProfile = getActiveStudentProfile();
  const currentSession = activeProfile.session || activeProfile.academicSession || "";
  const [selectedSession, setSelectedSession] = useState(() => currentSession || "All Sessions");
  const [searchTerm, setSearchTerm] = useState("");
  const [ledgerData, setLedgerData] = useState(() => getStudentLedgerEntries(activeProfile.rollNumber || activeProfile.scholarNo));
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { ref: tableContainerRef, scrollLeftBy, scrollRightBy, events: dragEvents } = useDragToScroll();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSession]);

  const reloadData = () => {
    const active = getActiveStudentProfile();
    const entries = getStudentLedgerEntries(active.rollNumber || active.scholarNo);
    setLedgerData(entries);
    const liveSession = active.session || active.academicSession || "";
    if (liveSession && selectedSession === "All Sessions") setSelectedSession(liveSession);
  };

  useEffect(() => {
    reloadData();
    const handleVisibility = () => {
      if (!document.hidden) reloadData();
    };

    window.addEventListener("feeDataUpdated", reloadData);
    window.addEventListener("scholarshipDataUpdated", reloadData);
    window.addEventListener("drccDataUpdated", reloadData);
    window.addEventListener("bankChallansUpdated", reloadData);
    window.addEventListener("concessionDataUpdated", reloadData);
    window.addEventListener("refundDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    window.addEventListener("focus", reloadData);
    window.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("feeDataUpdated", reloadData);
      window.removeEventListener("scholarshipDataUpdated", reloadData);
      window.removeEventListener("drccDataUpdated", reloadData);
      window.removeEventListener("bankChallansUpdated", reloadData);
      window.removeEventListener("concessionDataUpdated", reloadData);
      window.removeEventListener("refundDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
      window.removeEventListener("focus", reloadData);
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Filter transactions by chosen Academic Session and search keyword
  const filteredEntries = useMemo(() => {
    return ledgerData.filter((item) => {
      const matchSession =
        selectedSession === "All Sessions"
          ? Boolean(item.session)
          : item.session === selectedSession;

      const sRemarks = item.remarks || "";
      const sDate = item.date || "";
      const sDateSlash = item.dateSlash || "";
      const q = searchTerm.toLowerCase();

      const matchSearch =
        !searchTerm ||
        sRemarks.toLowerCase().includes(q) ||
        sDate.toLowerCase().includes(q) ||
        sDateSlash.toLowerCase().includes(q);

      return matchSession && matchSearch;
    });
  }, [ledgerData, selectedSession, searchTerm]);

  // Compute total Dr, Cr and Net Balance for the selected session
  const totalDr = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (Number(curr.dr) || 0), 0);
  }, [filteredEntries]);

  const totalCr = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (Number(curr.cr) || 0), 0);
  }, [filteredEntries]);

  const totalRefCr = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (Number(curr.refCr) || 0), 0);
  }, [filteredEntries]);

  const balanceDr = Math.max(0, totalDr - totalCr);
  const currentFee = getFeeDetails();
  const activeSessionLabel = currentFee.academicYear || currentSession || "Not assigned";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="Student Financial Ledger & Statement"
        description="Official double-entry financial ledger accounting for all credit/debit transactions, online receipts, scholarship disbursements, and balance audits."
      />

      {/* -- Summary Financial Metrics Cards -- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <p className="text-slate-500 font-bold uppercase text-[10px]">Academic Session</p>
          <p className="text-xl font-black text-purple-900">{selectedSession}</p>
          <p className="text-[10px] text-slate-400 font-medium">{filteredEntries.length} Ledger Entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
          <p className="text-amber-700 font-bold uppercase text-[10px]">Total Debited (Dr.)</p>
          <p className="text-xl font-black text-amber-900 font-mono">Rs.{totalDr.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-amber-600 font-medium">Invoiced Academic Fee</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
          <p className="text-emerald-700 font-bold uppercase text-[10px]">Total Credited (Cr.)</p>
          <p className="text-xl font-black text-emerald-800 font-mono">Rs.{totalCr.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Receipts & Cleared Funds</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-1">
          <p className="text-rose-700 font-bold uppercase text-[10px]">{totalRefCr > 0 ? "Refundable Balance" : "Net Ledger Balance"}</p>
          <p className="text-xl font-black text-rose-800 font-mono">
            Rs.{(totalRefCr > 0 ? totalRefCr : balanceDr).toLocaleString("en-IN")} {totalRefCr > 0 ? "Cr." : "Dr."}
          </p>
          <p className="text-[10px] text-rose-600 font-medium">
            {totalRefCr > 0 ? "Excess scholarship/refund due" : balanceDr === 0 ? "Done Zero Balance" : "Outstanding Dues"}
          </p>
        </div>
      </div>

      {/* -- Search & Session Choose Controls Toolbar -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Session Chooser Dropdown */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <label className="text-xs font-black text-slate-700">Choose Session:</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-purple-300 rounded-xl text-xs font-black text-purple-950 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer shadow-xs"
            >
              <option value="All Sessions">All Sessions</option>
              {Array.from(new Set(ledgerData.map((entry) => entry.session).filter(Boolean))).map((session) => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search remarks, receipt, date..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Action & Scroll Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
          {/* Scroll Buttons */}
          <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-xl border border-sky-200 text-xs">
            <span className="text-[10px] font-black text-sky-800 px-1.5 flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" /> Scroll:
            </span>
            <button
              onClick={() => scrollLeftBy(300)}
              className="p-1.5 bg-white hover:bg-sky-100 text-sky-700 rounded-lg font-bold border border-sky-200 cursor-pointer shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollRightBy(300)}
              className="p-1.5 bg-white hover:bg-sky-100 text-sky-700 rounded-lg font-bold border border-sky-200 cursor-pointer shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* -- Official Student Portal Ledger Table (Matching User Screenshot 1) -- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-4 sm:p-6 space-y-6">
        <div
          ref={tableContainerRef}
          {...dragEvents}
          className="overflow-x-auto select-none border border-[#bce2fe] rounded-xl scrollbar-thin scrollbar-thumb-sky-300 scrollbar-track-slate-100 active:cursor-grabbing"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#bce2fe] border-b border-[#a0d4fc] text-slate-900 font-black">
                <th className="py-2.5 px-3 border-r border-[#a0d4fc] w-12 text-center">Sr</th>
                <th className="py-2.5 px-3 border-r border-[#a0d4fc] w-32">Entry Date</th>
                <th className="py-2.5 px-3 border-r border-[#a0d4fc] w-28 text-left">Amount Dr.</th>
                <th className="py-2.5 px-3 border-r border-[#a0d4fc] w-28 text-left">Amount Cr.</th>
                <th className="py-2.5 px-3 border-r border-[#a0d4fc] w-32 text-left">Refundable Dr.</th>
                <th className="py-2.5 px-3 border-r border-[#a0d4fc] w-32 text-left">Refundable Cr.</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4ecff]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No ledger transactions found for Session {selectedSession}.
                  </td>
                </tr>
              ) : (
                filteredEntries
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-sky-50/50 transition-colors border-b border-[#d4ecff] text-slate-800"
                  >
                    <td className="py-2.5 px-3 border-r border-[#d4ecff] text-center font-bold text-slate-600">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#d4ecff] font-medium whitespace-nowrap">
                      {row.date}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#d4ecff] font-mono font-bold text-slate-900">
                      {row.dr ? Number(row.dr).toLocaleString("en-IN") : ""}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#d4ecff] font-mono font-bold text-slate-900">
                      {row.cr ? Number(row.cr).toLocaleString("en-IN") : ""}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#d4ecff] font-mono">
                      {row.refDr ? Number(row.refDr).toLocaleString("en-IN") : ""}
                    </td>

                    <td className="py-2.5 px-3 border-r border-[#d4ecff] font-mono">
                      {row.refCr ? Number(row.refCr).toLocaleString("en-IN") : ""}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-[11px] leading-relaxed text-slate-700">
                      {row.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredEntries.length / itemsPerPage) || 1}
          totalItems={filteredEntries.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[5, 10, 20]}
        />

        {/* -- Total / Balance Summary (Matching User Screenshot 1) -- */}
        <div className="text-center py-2">
          <p className="text-sm sm:text-base font-black text-slate-700 tracking-tight">
            Total/Balance={balanceDr.toLocaleString("en-IN")} Dr.
            {totalRefCr > 0 && <span className="text-emerald-700"> | Refundable={totalRefCr.toLocaleString("en-IN")} Cr.</span>}
          </p>
        </div>

        {/* -- Yellow Action Button: [ Click Here To View Ledger ] (Matching Screenshot 1) -- */}
        <div className="flex justify-center pb-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-8 py-3 bg-[#f59e0b] hover:bg-[#d97706] active:scale-98 text-slate-950 font-black text-sm rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            Click Here To View Ledger
          </button>
        </div>
      </div>

      {/* -- Official University Printable Ledger Statement Modal (Matching Screenshot 2) -- */}
      <AnimatePresence>
        {showPrintModal && (
          <StudentOfficialLedgerPrintModal
            isOpen={showPrintModal}
            onClose={() => setShowPrintModal(false)}
            ledgerEntries={filteredEntries}
            session={selectedSession === "All Sessions" ? (studentProfile.session || "") : selectedSession}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

