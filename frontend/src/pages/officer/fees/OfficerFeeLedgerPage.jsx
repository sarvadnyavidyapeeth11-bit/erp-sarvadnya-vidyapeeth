import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Search,
  Filter,
  IndianRupee,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getStudents, getPayments, initERP } from "../../../hooks/erpData";
import { getFeeDetailsForStudent } from "../../../hooks/studentPortalData";
import { useDragToScroll } from "../../../hooks/useDragToScroll";
import OfficialFeeReceiptModal from "../../../components/fees/OfficialFeeReceiptModal";

export default function OfficerFeeLedgerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudentLedger, setSelectedStudentLedger] = useState(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedPrintReceipt, setSelectedPrintReceipt] = useState(null);
  const [ledgerSession, setLedgerSession] = useState("All Sessions");
  const [allStudents, setAllStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { ref: tableContainerRef, scrollLeftBy, scrollRightBy, events: dragEvents } = useDragToScroll();

  const buildLedgerStudents = () => {
    const studentsFromErp = getStudents();
    const allPayments = getPayments();

    const merged = studentsFromErp.map((s) => {
      const studentPayments = allPayments.filter(p => p.rollNumber === s.rollNumber || p.studentId === s.id);
      const realReceipts = studentPayments.map(p => ({
        receiptNo: p.receiptNo || p.id,
        receiptDate: p.date,
        date: p.date,
        totalRecAmount: p.amount,
        amount: p.amount,
        particulars: p.remarks || `${s.course} Fee Payment`,
        mode: p.method || "Cash / Online",
        session: p.session || s.session || "",
        status: p.status || "Paid"
      }));

      const feeState = getFeeDetailsForStudent(s.rollNumber);
      const totalPaid = Number(feeState.totalPaid) || Number(s.paidFees) || studentPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const totalFee = Number(feeState.totalFees) || Number(s.totalFees) || 0;
      const hasOverdue = (feeState.feeBreakup || []).some((head) => head.isOverdue) && (feeState.totalPending || 0) > 0;

      return {
        id: s.id,
        rollNumber: s.rollNumber,
        name: s.name,
        course: s.course,
        semester: s.semester || "",
        section: s.section || "",
        session: s.session || "",
        totalFees: totalFee,
        paidFees: totalPaid,
        hasOverdue,
        status: s.status || "Active",
        phone: s.phone || "",
        receipts: realReceipts
      };
    });

    setAllStudents(merged);
  };

  useEffect(() => {
    initERP();
    buildLedgerStudents();
  }, []);

  // Listen to real-time events
  useEffect(() => {
    const handleUpdate = () => {
      buildLedgerStudents();
    };

    window.addEventListener("feeDataUpdated", handleUpdate);
    window.addEventListener("studentEnrollmentUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("feeDataUpdated", handleUpdate);
      window.removeEventListener("studentEnrollmentUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const filteredList = allStudents.filter((s) => {
    const pendingAmount = Math.max(0, (s.totalFees || 0) - (s.paidFees || 0));
    const hasFeeImposed = (Number(s.totalFees) || 0) > 0;
    const isPaid = hasFeeImposed && pendingAmount === 0;
    const isOverdue = hasFeeImposed && pendingAmount > 0 && s.hasOverdue;
    const isPartial = s.paidFees > 0 && pendingAmount > 0;
    const isDefaulter = hasFeeImposed && s.paidFees === 0;

    const matchSearch =
      !searchTerm ||
      String(s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.rollNumber || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchCourse = courseFilter === "All" || s.course === courseFilter;

    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Overdue" && isOverdue) ||
      (statusFilter === "Paid" && isPaid) ||
      (statusFilter === "Partial" && isPartial) ||
      (statusFilter === "Defaulter" && isDefaulter);

    return matchSearch && matchCourse && matchStatus;
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  const totalRevenueBilled = allStudents.reduce((sum, s) => sum + (s.totalFees || 0), 0);
  const totalRevenueCollected = allStudents.reduce((sum, s) => sum + (s.paidFees || 0), 0);
  const totalDuesOutstanding = Math.max(0, totalRevenueBilled - totalRevenueCollected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
              Student Accounts Ledger Registry
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Passbook
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            All Student Fee Ledgers & Passbook
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Inspect individual student billing history, real-time balances, itemized receipts, and print official account statements.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-right">
            <p className="text-[10px] font-black uppercase text-emerald-700">Total Collected</p>
            <p className="text-lg font-black text-slate-900 font-mono">Rs. {totalRevenueCollected.toLocaleString("en-IN")}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-right">
            <p className="text-[10px] font-black uppercase text-amber-700">Total Outstanding</p>
            <p className="text-lg font-black text-amber-700 font-mono">Rs. {totalDuesOutstanding.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name or Scholar No..."
            className="w-full bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-500">Course:</span>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold"
            >
              <option value="All">All Courses</option>
              {Array.from(new Set(allStudents.map((student) => student.course).filter(Boolean))).map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-500">Status:</span>
            {["All", "Overdue", "Paid", "Partial", "Defaulter"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Left-to-Right Horizontal Scroll Buttons */}
          <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-xl border border-purple-200 text-xs">
            <button
              onClick={() => scrollLeftBy(350)}
              className="p-1.5 bg-white hover:bg-purple-100 text-purple-700 rounded-lg font-bold border border-purple-200 cursor-pointer shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollRightBy(350)}
              className="p-1.5 bg-white hover:bg-purple-100 text-purple-700 rounded-lg font-bold border border-purple-200 cursor-pointer shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Ledgers Master Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div
          ref={tableContainerRef}
          {...dragEvents}
          className="overflow-x-auto select-none scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-slate-100 active:cursor-grabbing"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-purple-50/70 border-b border-purple-200 text-purple-900 font-black">
                <th className="py-3 px-4">Student Name & Scholar No</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4 text-right">Total Plan Fee (Rs.)</th>
                <th className="py-3 px-4 text-right">Paid Amount (Rs.)</th>
                <th className="py-3 px-4 text-right">Outstanding Dues (Rs.)</th>
                <th className="py-3 px-4 text-center">Clearance Status</th>
                <th className="py-3 px-4 text-center">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No student records found matching the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map((stu) => {
                  const dues = Math.max(0, (stu.totalFees || 0) - (stu.paidFees || 0));
                  const hasFeeImposed = (Number(stu.totalFees) || 0) > 0;
                  const isPaid = hasFeeImposed && dues === 0;
                  const isOverdue = hasFeeImposed && dues > 0 && stu.hasOverdue;
                  return (
                    <tr key={stu.rollNumber} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900">{stu.name}</p>
                        <p className="text-[10px] font-mono text-purple-700 font-bold">{stu.scholarNo || stu.rollNumber}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{stu.phone}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-800">{stu.course}</p>
                        <p className="text-[10px] text-slate-500">{stu.semester} - Sec {stu.section || "A"}</p>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                        Rs. {(stu.totalFees || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        Rs. {(stu.paidFees || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black">
                        <span className={hasFeeImposed ? (dues > 0 ? "text-rose-600" : "text-emerald-600") : "text-slate-500"}>
                          Rs. {dues.toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            !hasFeeImposed
                              ? "bg-slate-50 text-slate-600 border-slate-200"
                              : isOverdue
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : stu.paidFees > 0
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {!hasFeeImposed ? "Fee Not Imposed" : isOverdue ? "Due Date Exceeded" : isPaid ? "All Dues Cleared" : stu.paidFees > 0 ? "Partial Paid" : "Payment Pending"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentLedger(stu);
                            setShowLedgerModal(true);
                          }}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Ledger
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* -- 10-Item Pagination Bar -- */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredList.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-gray-800">{Math.min(filteredList.length, startIndex + itemsPerPage)}</strong> of{" "}
            <strong className="text-gray-800">{filteredList.length}</strong> students
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

      {/* Individual Student Ledger Passbook Modal */}
      <AnimatePresence>
        {showLedgerModal && selectedStudentLedger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{selectedStudentLedger.name}</h3>
                    <p className="text-xs text-purple-700 font-mono font-bold">
                      Scholar No: {selectedStudentLedger.scholarNo || selectedStudentLedger.rollNumber} - {selectedStudentLedger.course} ({selectedStudentLedger.semester})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Financial Balance Summary Card */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-gray-200 text-center font-mono">
                <div>
                  <p className="text-[10px] text-slate-500 font-sans font-bold">Approved Total Fee</p>
                  <p className="text-base font-black text-slate-900">Rs. {(selectedStudentLedger.totalFees || 0).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-sans font-bold">Total Paid & Cleared</p>
                  <p className="text-base font-black text-emerald-700">Rs. {(selectedStudentLedger.paidFees || 0).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-sans font-bold">Current Net Balance Dues</p>
                  <p className="text-base font-black text-rose-600">
                    Rs. {Math.max(0, (selectedStudentLedger.totalFees || 0) - (selectedStudentLedger.paidFees || 0)).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Transaction Receipts History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" /> Issued Payment Receipts & Audit Ledger
                  </h4>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500">Session:</span>
                    <select
                      value={ledgerSession}
                      onChange={(e) => setLedgerSession(e.target.value)}
                      className="px-2 py-0.5 bg-purple-50 border border-purple-200 rounded-lg text-[11px] font-black text-purple-900 outline-none"
                    >
                      <option value="All Sessions">All Sessions</option>
                      {Array.from(new Set((selectedStudentLedger.receipts || []).map((receipt) => receipt.session).filter(Boolean))).map((session) => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Receipt No</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Particulars</th>
                        <th className="p-2.5">Session</th>
                        <th className="p-2.5">Mode</th>
                        <th className="p-2.5 text-right">Amount (Rs.)</th>
                        <th className="p-2.5 text-center">Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const studentReceipts = (selectedStudentLedger.receipts || []).filter(r => {
                          if (ledgerSession === "All Sessions") return true;
                          return r.session === ledgerSession;
                        });

                        if (studentReceipts.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 font-semibold">
                                No fee receipts recorded for session {ledgerSession}.
                              </td>
                            </tr>
                          );
                        }

                        return studentReceipts.map((rec, i) => (
                          <tr key={i} className="hover:bg-purple-50/20">
                            <td className="p-2.5 font-mono font-bold text-purple-700">{rec.receiptNo}</td>
                            <td className="p-2.5 text-slate-500">{rec.receiptDate || rec.date}</td>
                            <td className="p-2.5 text-slate-800 font-medium max-w-xs truncate">{rec.particulars}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px] border border-purple-100">
                                {rec.session || "Not assigned"}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{rec.mode}</td>
                            <td className="p-2.5 text-right font-mono font-black text-slate-900">
                              Rs. {(rec.totalRecAmount || rec.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => setSelectedPrintReceipt(rec)}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                                title="Print Official Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Print Full Ledger Statement
                </button>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Passbook
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Formatted Fee Receipt Modal */}
      <OfficialFeeReceiptModal
        receipt={selectedPrintReceipt}
        student={selectedStudentLedger}
        isOpen={!!selectedPrintReceipt}
        onClose={() => setSelectedPrintReceipt(null)}
      />
    </motion.div>
  );
}



